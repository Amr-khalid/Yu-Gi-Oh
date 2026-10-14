/**
 * ConnectionManager.js
 * True Local-Network Real-Time Transport (WebSocket Server Relay + Offline Fallback)
 * Works seamlessly across devices on the same Wi-Fi/Hotspot network and between browser tabs.
 */

export class ConnectionManager {
  constructor() {
    this.instanceId = 'inst_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    this.role = null; // 'host' | 'client' | null
    this.transport = 'wifi';
    this.connected = false;
    this.messageListeners = [];
    this.statusListeners = [];
    this.peerName = '';
    this.myName = '';
    this.roomId = null;
    this.roomCode = null;
    this.discoveredRooms = [];
    this.ws = null;
    this.matchSeed = null;
    this.latencyMs = 1;
    this.pollInterval = null;
    this.pingInterval = null;

    if (typeof window !== 'undefined') {
      this.initWebSocket();
      this.initLocalFallback();
    }
  }

  setMyName(name) {
    if (name) {
      this.myName = name;
    }
  }

  initWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/yugioh-ws`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Query active rooms on connect
        this.sendWs({ type: 'GET_ACTIVE_ROOMS' });

        // If host was waiting for opponent when reconnect happened, re-announce
        if (this.role === 'host' && this.roomCode && !this.connected) {
          this.sendWs({
            type: 'CREATE_ROOM',
            roomCode: this.roomCode,
            hostName: this.myName,
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      this.ws.onclose = () => {
        // Try reconnecting periodically if connection dropped
        setTimeout(() => {
          if (!this.connected) {
            this.initWebSocket();
          }
        }, 1500);
      };

      this.ws.onerror = (e) => {
        console.warn('WS network error, offline fallback active');
      };
    } catch (e) {
      console.warn('WebSocket init error:', e);
    }
  }

  initLocalFallback() {
    // BroadcastChannel fallback for single-browser tabs
    if ('BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('yugioh_offline_multiplayer');
        this.channel.onmessage = (event) => {
          try {
            const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            if (!msg || msg.senderId === this.instanceId) return;
            this.handleLocalMessage(msg);
          } catch (e) {}
        };
      } catch (e) {}
    }
  }

  sendWs(payload) {
    if (this.ws && (this.ws.readyState === 1 || (typeof WebSocket !== 'undefined' && this.ws.readyState === WebSocket.OPEN))) {
      try {
        this.ws.send(JSON.stringify(payload));
        return true;
      } catch (e) {
        console.warn('WS send failed:', e);
      }
    }
    return false;
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendWs({ type: 'PING', timestamp: Date.now() });
      }
    }, 5000);
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  startRoomPolling() {
    this.stopRoomPolling();
    this.pollInterval = setInterval(() => {
      if (!this.connected && this.role === 'client') {
        this.sendWs({ type: 'GET_ACTIVE_ROOMS' });
      }
    }, 1200);
  }

  stopRoomPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  host(transport, myName) {
    this.stopRoomPolling();
    this.role = 'host';
    this.transport = transport;
    this.myName = myName || this.myName || 'المستضيف';
    this.roomCode = String(Math.floor(1000 + Math.random() * 9000));
    this.roomId = 'room_' + this.roomCode;
    this.connected = false;
    this.peerName = '';
    this.latencyMs = 1;
    this.notifyStatus();

    // 1. Announce to WebSocket server
    this.sendWs({
      type: 'CREATE_ROOM',
      roomCode: this.roomCode,
      hostName: this.myName,
    });

    // 2. Announce to Local Broadcast fallback
    this.sendLocal({
      type: 'ROOM_ANNOUNCE',
      roomCode: this.roomCode,
      hostName: this.myName,
      senderId: this.instanceId,
    });

    return Promise.resolve(true);
  }

  join(transport, myName) {
    this.role = 'client';
    this.transport = transport;
    this.myName = myName || this.myName || 'المنافس';
    this.connected = false;
    this.peerName = '';
    this.latencyMs = 1;
    this.notifyStatus();

    // Query server for active rooms & start rapid polling
    this.sendWs({ type: 'GET_ACTIVE_ROOMS' });
    this.startRoomPolling();

    return Promise.resolve(true);
  }

  normalizeRoomCode(raw) {
    if (!raw) return '';
    const arabicNumerals = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return String(raw)
      .split('')
      .map((c) => {
        const idx = arabicNumerals.indexOf(c);
        return idx !== -1 ? String(idx) : c;
      })
      .join('')
      .replace(/[^0-9]/g, '');
  }

  joinByCode(rawCode) {
    if (!rawCode) return false;
    const cleanCode = this.normalizeRoomCode(rawCode);
    if (cleanCode.length !== 4) return false;

    this.role = 'client';
    this.roomCode = cleanCode;
    this.connected = false;

    // Send join request to WebSocket server
    this.sendWs({
      type: 'JOIN_ROOM',
      roomCode: cleanCode,
      clientName: this.myName,
    });

    // Also send local fallback
    this.sendLocal({
      type: 'ROOM_CONNECT_REQ',
      roomCode: cleanCode,
      clientName: this.myName,
      senderId: this.instanceId,
    });

    return true;
  }

  sendLocal(msg) {
    if (this.channel) {
      try {
        this.channel.postMessage(JSON.stringify({ ...msg, senderId: this.instanceId }));
      } catch (e) {}
    }
  }

  handleServerMessage(msg) {
    // 0. Latency Pong reply
    if (msg.type === 'PONG') {
      if (msg.clientTime) {
        this.latencyMs = Math.max(1, Math.min(999, Date.now() - msg.clientTime));
        this.notifyStatus();
      }
      return;
    }

    // 1. Room successfully created by Host
    if (msg.type === 'ROOM_CREATED') {
      this.roomCode = msg.roomCode;
      this.notifyStatus();
    }

    // 2. Error joining room (room code invalid or host offline)
    else if (msg.type === 'ROOM_ERROR') {
      this.connected = false;
      this.peerName = '';
      this.notifyStatus();
      alert(msg.message || 'رمز الغرفة غير صحيح أو أن المستضيف غير متصل.');
    }

    // 3. Both Host and Client connected!
    else if (msg.type === 'ROOM_CONNECTED') {
      this.stopRoomPolling();
      this.connected = true;
      if (this.role === 'host') {
        this.peerName = msg.clientName || 'المنافس';
        // Send handshake confirmation immediately
        this.send({ type: 'HANDSHAKE_ACK', from: 'host', timestamp: Date.now() });
      } else {
        this.peerName = msg.hostName || 'المستضيف';
        this.send({ type: 'HANDSHAKE_ACK', from: 'client', timestamp: Date.now() });
      }
      this.roomCode = msg.roomCode;
      this.startHeartbeat();
      this.notifyStatus();
    }

    // 3.5 Handshake ACK received
    else if (msg.type === 'HANDSHAKE_ACK') {
      if (msg.timestamp) {
        this.latencyMs = Math.max(1, Math.min(999, Math.round((Date.now() - msg.timestamp) / 2)));
      }
      this.notifyStatus();
      this.dispatchMessage(msg);
    }

    // 4. List of active rooms from server
    else if (msg.type === 'ACTIVE_ROOMS_LIST') {
      this.discoveredRooms = Array.isArray(msg.rooms) ? msg.rooms : [];
      this.notifyStatus();
    }

    // 5. Start duel signal from peer
    else if (msg.type === 'START_DUEL' || msg.type === 'DUEL_COUNTDOWN_START') {
      if (msg.seed) {
        this.matchSeed = msg.seed;
      }
      this.dispatchMessage(msg);
    }

    // 6. Duel action, janken, or surrender
    else if (msg.type === 'DUEL_ACTION' || msg.type === 'SURRENDER' || (typeof msg.type === 'string' && msg.type.startsWith('JANKEN_'))) {
      this.dispatchMessage(msg);
    }

    // 7. Peer disconnected
    else if (msg.type === 'PEER_DISCONNECTED') {
      this.stopHeartbeat();
      alert(msg.reason || 'انقطع الاتصال مع المنافس.');
      this.connected = false;
      this.peerName = '';
      this.notifyStatus();
    }
  }

  handleLocalMessage(msg) {
    // Local fallback for dual tabs on same browser
    if (msg.type === 'ROOM_CONNECT_REQ' && this.role === 'host' && !this.connected) {
      if (msg.roomCode === this.roomCode) {
        this.connected = true;
        this.peerName = msg.clientName || 'المنافس';
        this.notifyStatus();
        this.sendLocal({
          type: 'ROOM_CONNECTED_LOCAL',
          roomCode: this.roomCode,
          hostName: this.myName,
          clientName: this.peerName,
        });
      }
    } else if (msg.type === 'ROOM_CONNECTED_LOCAL' && this.role === 'client' && !this.connected) {
      if (msg.roomCode === this.roomCode) {
        this.connected = true;
        this.peerName = msg.hostName || 'المستضيف';
        this.notifyStatus();
      }
    } else if (
      msg.type === 'START_DUEL' ||
      msg.type === 'DUEL_COUNTDOWN_START' ||
      msg.type === 'DUEL_ACTION' ||
      msg.type === 'SURRENDER' ||
      (typeof msg.type === 'string' && msg.type.startsWith('JANKEN_'))
    ) {
      this.dispatchMessage(msg);
    }
  }

  send(message) {
    // 1. Send to WebSocket server
    const wsSent = this.sendWs(message);

    // 2. Also send to local channel fallback
    this.sendLocal(message);
  }

  broadcast(message) {
    this.send(message);
  }

  cancel() {
    this.stopHeartbeat();
    this.stopRoomPolling();
    if (this.role === 'host' && this.roomCode) {
      this.sendWs({ type: 'CLOSE_ROOM', roomCode: this.roomCode });
    }
    this.role = null;
    this.connected = false;
    this.peerName = '';
    this.roomCode = null;
    this.notifyStatus();
  }

  dispatchMessage(msg) {
    for (const listener of this.messageListeners) {
      try {
        listener(msg);
      } catch (e) {
        console.error(e);
      }
    }
  }

  onMessage(cb) {
    this.messageListeners.push(cb);
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== cb);
    };
  }

  onStatusChange(cb) {
    this.statusListeners.push(cb);
    cb(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== cb);
    };
  }

  getStatus() {
    let hostname = 'localhost';
    try {
      if (typeof window !== 'undefined' && window.location && window.location.hostname) {
        hostname = window.location.hostname;
      }
    } catch (e) {}

    return {
      connected: !!this.connected,
      role: this.role,
      transport: this.transport,
      peerName: this.peerName || '',
      myName: this.myName || '',
      roomCode: this.roomCode || null,
      discoveredRooms: Array.isArray(this.discoveredRooms) ? this.discoveredRooms : [],
      isBroadcasting: this.role === 'host' && !this.connected,
      ipOrDevice: hostname,
      latencyMs: this.latencyMs || 1,
    };
  }

  notifyStatus() {
    const status = this.getStatus();
    for (const cb of this.statusListeners) {
      cb(status);
    }
  }

  disconnect() {
    this.cancel();
  }
}

export const connectionManager = new ConnectionManager();
