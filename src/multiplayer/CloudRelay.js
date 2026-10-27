/**
 * CloudRelay.js
 * Universal Cloud Signaling & Matchmaking Relay over Secure WebSockets (WSS).
 * Connects duelists anywhere in Egypt or worldwide across mobile data (4G/5G),
 * different Wi-Fis, or routers with AP client isolation.
 * Works seamlessly with zero server setup using public enterprise WSS brokers.
 */

export class CloudRelay {
  constructor() {
    this.clientId = 'pharaoh_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    this.ws = null;
    this.connected = false;
    this.roomCode = null;
    this.role = null;
    this.subscriptions = new Map(); // topic -> handler
    this.messageListeners = [];
    this.roomDiscoveredListeners = [];
    this.pingInterval = null;
    this.announceInterval = null;
    this.currentBrokerIndex = 0;
    this.isDestroyed = false;

    // High-availability public WSS brokers (free, encrypted, global)
    this.brokers = [
      'wss://broker.hivemq.com:8884/mqtt',
      'wss://broker.emqx.io:8084/mqtt',
    ];
  }

  // --- Lightweight MQTT 3.1.1 Binary Protocol Encoder/Decoder ---
  _makeConnectPacket() {
    const protocol = [0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c]; // MQTT 3.1.1, clean session, 60s
    const clientBytes = new TextEncoder().encode(this.clientId);
    const clientLen = clientBytes.length;
    const payload = new Uint8Array(2 + clientLen);
    payload[0] = (clientLen >> 8) & 0xff;
    payload[1] = clientLen & 0xff;
    payload.set(clientBytes, 2);

    const varHeaderAndPayload = new Uint8Array(protocol.length + payload.length);
    varHeaderAndPayload.set(protocol, 0);
    varHeaderAndPayload.set(payload, protocol.length);

    const len = varHeaderAndPayload.length;
    const packet = new Uint8Array(2 + len);
    packet[0] = 0x10; // CONNECT
    packet[1] = len;
    packet.set(varHeaderAndPayload, 2);
    return packet;
  }

  _makePublishPacket(topic, obj) {
    const topicBytes = new TextEncoder().encode(topic);
    const msgBytes = new TextEncoder().encode(typeof obj === 'string' ? obj : JSON.stringify(obj));
    const topicLen = topicBytes.length;

    const varHeader = new Uint8Array(2 + topicLen);
    varHeader[0] = (topicLen >> 8) & 0xff;
    varHeader[1] = topicLen & 0xff;
    varHeader.set(topicBytes, 2);

    const len = varHeader.length + msgBytes.length;
    // Length encoding (supports standard payloads)
    let lengthBytes = [];
    let rem = len;
    do {
      let b = rem % 128;
      rem = Math.floor(rem / 128);
      if (rem > 0) b = b | 128;
      lengthBytes.push(b);
    } while (rem > 0);

    const packet = new Uint8Array(1 + lengthBytes.length + len);
    packet[0] = 0x30; // PUBLISH QoS 0
    packet.set(lengthBytes, 1);
    packet.set(varHeader, 1 + lengthBytes.length);
    packet.set(msgBytes, 1 + lengthBytes.length + varHeader.length);
    return packet;
  }

  _makeSubscribePacket(topic, packetId = 1) {
    const topicBytes = new TextEncoder().encode(topic);
    const topicLen = topicBytes.length;
    const payload = new Uint8Array(2 + topicLen + 1);
    payload[0] = (topicLen >> 8) & 0xff;
    payload[1] = topicLen & 0xff;
    payload.set(topicBytes, 2);
    payload[2 + topicLen] = 0x00; // QoS 0

    const varHeader = new Uint8Array([ (packetId >> 8) & 0xff, packetId & 0xff ]);
    const len = varHeader.length + payload.length;

    const packet = new Uint8Array(2 + len);
    packet[0] = 0x82; // SUBSCRIBE
    packet[1] = len;
    packet.set(varHeader, 2);
    packet.set(payload, 2 + varHeader.length);
    return packet;
  }

  _makePingPacket() {
    return new Uint8Array([0xc0, 0x00]); // PINGREQ
  }

  // --- Network Connection Management ---
  connect() {
    if (this.isDestroyed) return Promise.resolve(false);
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve(this.connected);
    }

    const brokerUrl = this.brokers[this.currentBrokerIndex % this.brokers.length];

    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.currentBrokerIndex++;
          resolve(false);
        }
      }, 3500);

      try {
        const ws = new WebSocket(brokerUrl, ['mqtt']);
        this.ws = ws;
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
          try {
            ws.send(this._makeConnectPacket());
          } catch (e) {
            console.warn('CloudRelay sendConnect error:', e);
          }
        };

        ws.onmessage = (event) => {
          try {
            const buf = new Uint8Array(event.data);
            const packetType = buf[0] >> 4;

            if (packetType === 2) { // CONNACK
              this.connected = true;
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                resolve(true);
              }
              this._startPing();
              this._resubscribeAll();
            } else if (packetType === 3) { // PUBLISH
              this._handleIncomingPublish(buf);
            }
          } catch (err) {
            console.warn('CloudRelay onmessage error:', err);
          }
        };

        ws.onclose = () => {
          this.connected = false;
          this._stopPing();
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve(false);
          }
          if (!this.isDestroyed) {
            setTimeout(() => {
              if (!this.isDestroyed && !this.connected) {
                this.currentBrokerIndex++;
                this.connect();
              }
            }, 2000);
          }
        };

        ws.onerror = (e) => {
          this.connected = false;
        };
      } catch (e) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(false);
        }
      }
    });
  }

  _startPing() {
    this._stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(this._makePingPacket());
        } catch (e) {}
      }
    }, 25000);
  }

  _stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  _resubscribeAll() {
    for (const [topic] of this.subscriptions.entries()) {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(this._makeSubscribePacket(topic));
        }
      } catch (e) {}
    }
  }

  _handleIncomingPublish(buf) {
    // Parse variable header
    let pos = 1;
    // Parse variable remaining length
    let multiplier = 1;
    let remLen = 0;
    while (pos < buf.length) {
      let digit = buf[pos++];
      remLen += (digit & 0x7f) * multiplier;
      multiplier *= 128;
      if ((digit & 0x80) === 0) break;
    }

    if (pos + 2 > buf.length) return;
    const topicLen = (buf[pos] << 8) | buf[pos + 1];
    pos += 2;
    if (pos + topicLen > buf.length) return;

    const topicBytes = buf.subarray(pos, pos + topicLen);
    const topic = new TextDecoder().decode(topicBytes);
    pos += topicLen;

    const payloadBytes = buf.subarray(pos);
    const payloadStr = new TextDecoder().decode(payloadBytes);

    let msg = null;
    try {
      msg = JSON.parse(payloadStr);
    } catch (e) {
      msg = { raw: payloadStr };
    }

    // Match subscriptions
    for (const [subTopic, handler] of this.subscriptions.entries()) {
      if (subTopic === topic || (subTopic.endsWith('#') && topic.startsWith(subTopic.slice(0, -1)))) {
        try {
          handler(topic, msg);
        } catch (e) {
          console.error('CloudRelay handler error:', e);
        }
      }
    }
  }

  subscribe(topic, handler) {
    this.subscriptions.set(topic, handler);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(this._makeSubscribePacket(topic));
      } catch (e) {}
    }
  }

  publish(topic, obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(this._makePublishPacket(topic, obj));
        return true;
      } catch (e) {
        console.warn('CloudRelay publish failed:', e);
      }
    }
    return false;
  }

  // --- High Level Matchmaking API ---

  /**
   * Host announces a room to the world via cloud relay.
   * Periodically broadcasts to the global lobby discovery topic.
   */
  async hostRoom(roomCode, hostData) {
    this.roomCode = String(roomCode).trim();
    this.role = 'host';
    await this.connect();

    // Subscribe to all actions targeting this room
    this.subscribe(`yugioh/rooms/${this.roomCode}/#`, (topic, msg) => {
      for (const listener of this.messageListeners) {
        try {
          listener(topic, msg);
        } catch (e) {}
      }
    });

    const announcePayload = {
      type: 'YUGIOH_ANNOUNCE',
      roomCode: this.roomCode,
      hostName: hostData.hostName || 'المستضيف',
      gameMode: hostData.gameMode || '1v1',
      settings: hostData.settings || {},
      transport: 'cloud_relay',
      timestamp: Date.now(),
    };

    // Announce immediately
    this.publish('yugioh/lobby/discovery', announcePayload);

    // Periodically re-announce room every 2 seconds while waiting
    if (this.announceInterval) clearInterval(this.announceInterval);
    this.announceInterval = setInterval(() => {
      announcePayload.timestamp = Date.now();
      this.publish('yugioh/lobby/discovery', announcePayload);
    }, 2000);
  }

  /**
   * Search for all active nearby/online rooms on the cloud lobby.
   */
  async startLobbyListening(onRoomDiscovered) {
    await this.connect();
    if (onRoomDiscovered && !this.roomDiscoveredListeners.includes(onRoomDiscovered)) {
      this.roomDiscoveredListeners.push(onRoomDiscovered);
    }

    this.subscribe('yugioh/lobby/discovery', (topic, room) => {
      if (!room || !room.roomCode) return;
      for (const listener of this.roomDiscoveredListeners) {
        try {
          listener(room);
        } catch (e) {}
      }
    });
  }

  /**
   * Client joins an existing room by its 4-digit code.
   */
  async joinRoom(roomCode, clientData) {
    this.roomCode = String(roomCode).trim();
    this.role = 'client';
    await this.connect();

    // Subscribe to this room's messages
    this.subscribe(`yugioh/rooms/${this.roomCode}/#`, (topic, msg) => {
      for (const listener of this.messageListeners) {
        try {
          listener(topic, msg);
        } catch (e) {}
      }
    });

    const joinPayload = {
      type: 'JOIN_REQ',
      roomCode: this.roomCode,
      clientName: clientData.clientName || 'المنافس',
      targetSlotIndex: clientData.targetSlotIndex ?? null,
      timestamp: Date.now(),
    };

    // Send join request
    this.publish(`yugioh/rooms/${this.roomCode}/join`, joinPayload);

    // Retry sending join every 700ms up to 5 times
    let count = 0;
    const retryTimer = setInterval(() => {
      count++;
      if (count > 5 || this.isDestroyed) {
        clearInterval(retryTimer);
      } else {
        this.publish(`yugioh/rooms/${this.roomCode}/join`, joinPayload);
      }
    }, 700);
  }

  /**
   * Broadcast game events (cards played, attacks, sync, etc.)
   */
  sendGameMessage(payload) {
    if (!this.roomCode) return false;
    return this.publish(`yugioh/rooms/${this.roomCode}/game`, payload);
  }

  addMessageListener(listener) {
    if (listener && !this.messageListeners.includes(listener)) {
      this.messageListeners.push(listener);
    }
  }

  removeMessageListener(listener) {
    this.messageListeners = this.messageListeners.filter((l) => l !== listener);
  }

  stopAnnouncing() {
    if (this.announceInterval) {
      clearInterval(this.announceInterval);
      this.announceInterval = null;
    }
  }

  destroy() {
    this.isDestroyed = true;
    this.stopAnnouncing();
    this._stopPing();
    this.subscriptions.clear();
    this.messageListeners = [];
    this.roomDiscoveredListeners = [];
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    this.connected = false;
  }
}

export const cloudRelay = new CloudRelay();
export default cloudRelay;
