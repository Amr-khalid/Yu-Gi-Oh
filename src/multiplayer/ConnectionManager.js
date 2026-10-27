/**
 * ConnectionManager.js
 * Multi-Tier Dual-Channel Transport (Cloud Relay over WSS + Embedded Android Server + Hotspot UDP Discovery)
 * Works seamlessly on Android APK (Hotspot/Wi-Fi with zero internet) and anywhere globally over 4G/5G/Internet.
 */

import { Capacitor, registerPlugin } from '@capacitor/core';
import { cloudRelay } from './CloudRelay.js';

// Register native Android LocalServer plugin
const LocalServer = registerPlugin('LocalServer');

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
    this.bluetoothDevice = null;
    this.currentWsUrl = null;
    this.localServerIp = null;
    this.targetHostIp = '192.168.43.1'; // Standard Android Hotspot Gateway IP
    this.isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
    this.seenMessageIds = new Set();

    // Tag 2v2 Multiplayer State
    this.gameMode = '1v1'; // '1v1' | 'tag_2v2'
    this.mySlot = 0; // 0, 1 (Team 0), 2, 3 (Team 1)
    this.myTeam = 0; // 0 or 1
    this.tagSlots = [];
    this.tagSettings = {
      lifePoints: 16000,
      summonRule: 'per_player', // 'per_player' | 'team_shared'
      graveyardShare: true,
      turnTimer: 90,
    };
    this.teammateName = '';
    this.teammateHand = [];

    if (typeof window !== 'undefined') {
      // Setup Universal Cloud Relay Discovery & Messaging
      try {
        cloudRelay.startLobbyListening((room) => {
          if (!room || !room.roomCode) return;
          const code = this.normalizeRoomCode(room.roomCode);
          const list = Array.isArray(this.discoveredRooms) ? [...this.discoveredRooms] : [];
          const existingIdx = list.findIndex(
            (r) => this.normalizeRoomCode(r.roomCode) === code
          );
          const enriched = {
            ...room,
            roomCode: code,
            lastSeen: Date.now(),
            transport: 'cloud_relay',
          };
          if (existingIdx !== -1) {
            list[existingIdx] = { ...list[existingIdx], ...enriched };
          } else {
            list.push(enriched);
          }
          this.discoveredRooms = list;
          this.notifyStatus();
        });

        cloudRelay.addMessageListener((topic, msg) => {
          this.handleCloudRelayMessage(topic, msg);
        });
      } catch (e) {
        console.warn('CloudRelay init failed:', e);
      }

      if (!this.isNative) {
        // In browser / dev environment, connect to Vite dev server relay
        this.initWebSocket();
      } else {
        // In Android APK, get initial IP address & setup UDP discovery
        this.queryDeviceIp();
        try {
          LocalServer.addListener('onRoomDiscovered', (room) => {
            if (!room || !room.roomCode) return;
            const code = this.normalizeRoomCode(room.roomCode);
            const list = Array.isArray(this.discoveredRooms) ? [...this.discoveredRooms] : [];
            const existingIdx = list.findIndex(
              (r) => this.normalizeRoomCode(r.roomCode) === code
            );
            const enriched = {
              ...room,
              roomCode: code,
              lastSeen: Date.now(),
              transport: 'hotspot_udp',
            };
            if (existingIdx !== -1) {
              list[existingIdx] = { ...list[existingIdx], ...enriched };
            } else {
              list.push(enriched);
            }
            this.discoveredRooms = list;
            this.notifyStatus();
          });
        } catch (e) {
          console.warn('Failed to register onRoomDiscovered listener:', e);
        }
      }
      this.initLocalFallback();
    }
  }

  async queryDeviceIp() {
    if (this.isNative) {
      try {
        const res = await LocalServer.getDeviceIp();
        if (res && res.ip) {
          this.localServerIp = res.ip;
          this.notifyStatus();
        }
      } catch (e) {
        console.warn('Failed to query device IP:', e);
      }
    }
  }

  setMyName(name) {
    if (name) {
      this.myName = name;
    }
  }

  setTargetHostIp(ip) {
    if (ip && typeof ip === 'string') {
      this.targetHostIp = ip.trim();
    }
  }

  connectWs(url, timeoutMs = 2500) {
    return new Promise((resolve) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentWsUrl === url) {
        resolve(true);
        return;
      }

      if (this.ws) {
        try {
          this.ws.onclose = null;
          this.ws.onerror = null;
          this.ws.close();
        } catch (e) {}
        this.ws = null;
      }

      this.currentWsUrl = url;

      try {
        const ws = new WebSocket(url);
        this.ws = ws;

        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        }, timeoutMs);

        ws.onopen = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve(true);
          }
          if (this.role === 'host' && this.roomCode && !this.connected) {
            this.sendWs({
              type: 'CREATE_ROOM',
              roomCode: this.roomCode,
              hostName: this.myName,
              transport: this.transport,
              gameMode: this.gameMode,
              settings: this.tagSettings,
            });
          } else if (this.role === 'client') {
            if (this.roomCode && !this.connected) {
              this.sendWs({
                type: 'JOIN_ROOM',
                roomCode: this.roomCode,
                clientName: this.myName,
                targetSlotIndex: this.pendingSlotIndex ?? null,
              });
            } else {
              this.sendWs({ type: 'GET_ACTIVE_ROOMS' });
            }
          }
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            this.handleServerMessage(msg);
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        ws.onclose = () => {
          if (this.connected && (this.role === 'host' || this.role === 'client') && this.currentWsUrl === url) {
            // Auto reconnect after brief pause if we had an established connection
            setTimeout(() => {
              if (this.connected && this.currentWsUrl) {
                this.connectWs(this.currentWsUrl);
              }
            }, 1800);
          }
        };

        ws.onerror = (e) => {
          console.warn('WS network error on:', url);
        };
      } catch (err) {
        console.warn('WebSocket init exception:', err);
        resolve(false);
      }
    });
  }

  async ensureConnected(customUrl = null) {
    let targetUrl = customUrl;
    if (!targetUrl) {
      if (this.isNative) {
        targetUrl = `ws://${this.targetHostIp}:9001/yugioh-ws`;
      } else {
        const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
        targetUrl = `${protocol}//${host}/yugioh-ws`;
      }
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN && (!customUrl || this.currentWsUrl === customUrl)) {
      return true;
    }

    if (this.ws && this.ws.readyState === WebSocket.CONNECTING && (!customUrl || this.currentWsUrl === customUrl)) {
      return new Promise((resolve) => {
        let count = 0;
        const interval = setInterval(() => {
          count++;
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            clearInterval(interval);
            resolve(true);
          } else if (!this.ws || this.ws.readyState > WebSocket.OPEN || count >= 35) {
            clearInterval(interval);
            resolve(false);
          }
        }, 100);
      });
    }

    return await this.connectWs(targetUrl);
  }

  initWebSocket() {
    try {
      const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
      const wsUrl = `${protocol}//${host}/yugioh-ws`;
      return this.connectWs(wsUrl);
    } catch (e) {
      console.warn('WebSocket init error:', e);
      return Promise.resolve(false);
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
    this.pollInterval = setInterval(async () => {
      if (!this.connected && this.role === 'client') {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.sendWs({ type: 'GET_ACTIVE_ROOMS' });
        } else {
          await this.scanAndConnectHost();
        }
      }
    }, 1200);
  }

  stopRoomPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  prepareHostCode() {
    this.roomCode = String(Math.floor(1000 + Math.random() * 9000));
    this.roomId = 'room_' + this.roomCode;
    this.role = 'host';
    this.notifyStatus();
    return this.roomCode;
  }

  async host(transport, myName, gameMode = '1v1', settings = {}, explicitCode = null) {
    this.stopRoomPolling();
    this.role = 'host';
    this.transport = transport;
    this.myName = myName || this.myName || 'المستضيف';
    this.gameMode = gameMode;
    this.mySlot = 0;
    this.myTeam = 0;
    if (settings && Object.keys(settings).length > 0) {
      this.tagSettings = { ...this.tagSettings, ...settings };
    }
    this.roomCode = explicitCode || this.roomCode || String(Math.floor(1000 + Math.random() * 9000));
    this.roomId = 'room_' + this.roomCode;
    this.connected = false;
    this.peerName = '';
    this.teammateName = '';
    this.teammateHand = [];
    this.latencyMs = 1;

    // Immediately notify UI so room code appears in 0ms synchronously!
    this.notifyStatus();

    // Launch background services asynchronously without blocking the UI
    (async () => {
      let targetUrl = null;
      if (this.isNative) {
        try {
          const res = await LocalServer.startServer({ port: 9001 });
          if (res && res.ip) {
            this.localServerIp = res.ip;
          }
          await LocalServer.startAnnouncing({
            roomCode: this.roomCode,
            hostName: this.myName,
            ip: this.localServerIp || '192.168.43.1',
            port: 9001,
            gameMode: this.gameMode,
          });
        } catch (e) {
          console.error('Error starting native local server or UDP announce:', e);
        }
        targetUrl = 'ws://127.0.0.1:9001/yugioh-ws';
      }

      // Announce to Cloud Relay (matches duelists over 4G/5G, Internet, and Wi-Fi)
      try {
        cloudRelay.hostRoom(this.roomCode, {
          hostName: this.myName,
          gameMode: this.gameMode,
          settings: this.tagSettings,
        });
      } catch (e) {
        console.warn('CloudRelay host error:', e);
      }

      this.notifyStatus();

      // Ensure connection is fully OPEN before announcing room creation
      try {
        await this.ensureConnected(targetUrl);
        this.sendWs({
          type: 'CREATE_ROOM',
          roomCode: this.roomCode,
          hostName: this.myName,
          transport: this.transport,
          gameMode: this.gameMode,
          settings: this.tagSettings,
        });
      } catch (e) {
        console.warn('WebSocket connect error in host background:', e);
      }

      // Announce to Local Broadcast fallback
      this.sendLocal({
        type: 'ROOM_ANNOUNCE',
        roomCode: this.roomCode,
        hostName: this.myName,
        transport: this.transport,
        gameMode: this.gameMode,
        settings: this.tagSettings,
        senderId: this.instanceId,
      });
    })();

    return true;
  }

  updateTagSlot(slotIndex, isBot, botDifficulty = 'normal', botName = '') {
    if (this.tagSlots && this.tagSlots[slotIndex]) {
      this.tagSlots[slotIndex] = {
        ...this.tagSlots[slotIndex],
        isOccupied: isBot,
        isBot: !!isBot,
        botDifficulty: botDifficulty || 'normal',
        name: isBot ? (botName || 'بوت') : 'شاغر (انضمام أو بوت)',
      };
      this.notifyStatus();
    }
    this.send({
      type: 'TAG_UPDATE_SLOT',
      slotIndex,
      isBot,
      botDifficulty,
      botName,
    });
  }

  updateTagSettings(settings) {
    if (settings) {
      this.tagSettings = { ...this.tagSettings, ...settings };
      this.send({
        type: 'TAG_UPDATE_SETTINGS',
        settings: this.tagSettings,
      });
      this.notifyStatus();
    }
  }

  swapTagSlots(fromSlot, toSlot) {
    const payload = {
      type: 'TAG_SWAP_SLOTS',
      fromSlot,
      toSlot,
      roomCode: this.roomCode,
    };
    this.send(payload);

    // Apply locally immediately so the UI responds without any network delay
    if (this.tagSlots && this.tagSlots.length === 4) {
      const slots = [...this.tagSlots];
      const temp = slots[fromSlot];
      slots[fromSlot] = slots[toSlot];
      slots[toSlot] = temp;
      slots[fromSlot].slotIndex = fromSlot;
      slots[fromSlot].team = fromSlot < 2 ? 0 : 1;
      slots[toSlot].slotIndex = toSlot;
      slots[toSlot].team = toSlot < 2 ? 0 : 1;
      this.tagSlots = slots;
      if (this.mySlot === fromSlot) {
        this.mySlot = toSlot;
        this.myTeam = toSlot < 2 ? 0 : 1;
      } else if (this.mySlot === toSlot) {
        this.mySlot = fromSlot;
        this.myTeam = fromSlot < 2 ? 0 : 1;
      }
      this.notifyStatus();

      if (this.role === 'host') {
        this.send({
          type: 'TAG_ROOM_SLOTS_UPDATED',
          slots: this.tagSlots,
          settings: this.tagSettings,
        });
      }
    }
  }

  sendTeamPing(pingType, text = '', targetZone = null) {
    const payload = {
      type: 'TEAM_PING',
      senderSlot: this.mySlot,
      team: this.myTeam,
      senderName: this.myName,
      pingType,
      text,
      targetZone,
      timestamp: Date.now(),
    };
    this.send(payload);
    return payload;
  }

  syncTeammateHand(handCards) {
    const payload = {
      type: 'TAG_SYNC_HAND',
      senderSlot: this.mySlot,
      team: this.myTeam,
      senderName: this.myName,
      handCards: Array.isArray(handCards) ? handCards.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        atk: c.atk,
        def: c.def,
        level: c.level,
        description: c.description,
        attribute: c.attribute,
        race: c.race,
      })) : [],
      timestamp: Date.now(),
    };
    this.send(payload);
  }

  async scanAndConnectHost(preferredIp = null) {
    if (!this.isNative) {
      const ok = await this.ensureConnected();
      if (ok) this.sendWs({ type: 'GET_ACTIVE_ROOMS' });
      return ok;
    }

    const candidateIps = [];

    // 1. Explicit preferred/custom IP
    if (preferredIp && typeof preferredIp === 'string' && preferredIp.trim()) {
      candidateIps.push(preferredIp.trim());
    }

    // 2. Android DHCP Gateway IP (Host hotspot gateway)
    try {
      const gwRes = await LocalServer.getGatewayIp();
      if (gwRes && gwRes.gatewayIp && !candidateIps.includes(gwRes.gatewayIp)) {
        candidateIps.push(gwRes.gatewayIp);
      }
    } catch (e) {}

    // 3. Any IPs from already discovered rooms
    for (const r of (this.discoveredRooms || [])) {
      if (r && r.ip && !candidateIps.includes(r.ip)) {
        candidateIps.push(r.ip);
      }
    }

    // 4. Standard Hotspot defaults
    const defaults = ['192.168.43.1', '192.168.49.1', '192.168.50.1'];
    for (const d of defaults) {
      if (!candidateIps.includes(d)) candidateIps.push(d);
    }

    for (const ip of candidateIps) {
      const url = `ws://${ip}:9001/yugioh-ws`;
      const ok = await this.connectWs(url, 950);
      if (ok) {
        this.targetHostIp = ip;
        this.notifyStatus();
        this.sendWs({ type: 'GET_ACTIVE_ROOMS' });
        return true;
      }
    }

    if (candidateIps[0]) {
      this.targetHostIp = candidateIps[0];
      this.notifyStatus();
    }
    return false;
  }

  async join(transport, myName, customHostIp) {
    this.role = 'client';
    this.transport = transport;
    this.myName = myName || this.myName || 'المنافس';
    this.connected = false;
    this.peerName = '';
    this.latencyMs = 1;

    if (this.isNative) {
      try {
        LocalServer.startDiscovery();
      } catch (e) {}
    }

    this.notifyStatus();

    // Auto-discover and connect to the active host server!
    await this.scanAndConnectHost(customHostIp);

    // Start rapid room polling
    this.startRoomPolling();

    return true;
  }

  isWebBluetoothSupported() {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.bluetooth &&
      typeof navigator.bluetooth.requestDevice === 'function'
    );
  }

  async scanBluetoothDevice() {
    if (!this.isWebBluetoothSupported()) {
      return {
        success: false,
        supported: false,
        error: 'متصفحك لا يدعم Web Bluetooth API مباشرة. استخدم نمط نقطة الاتصال (Hotspot) للعب المباشر بدون إنترنت بسرعة فائقة!',
      };
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access'],
      });

      if (device) {
        this.bluetoothDevice = {
          id: device.id,
          name: device.name || 'جهاز بلوتوث مقترن',
        };
        this.notifyStatus();
        return {
          success: true,
          supported: true,
          device: this.bluetoothDevice,
        };
      }
    } catch (err) {
      if (err.name === 'NotFoundError' || err.message?.includes('User cancelled')) {
        return { success: false, supported: true, cancelled: true };
      }
      return { success: false, supported: true, error: err.message };
    }
    return { success: false, supported: true };
  }

  normalizeRoomCode(raw) {
    if (!raw) return '';
    const str = String(raw).trim();
    // Comprehensive normalization for Arabic-Indic digits (\u0660-\u0669), Eastern Arabic/Persian (\u06F0-\u06F9), full-width, and symbols
    const arabicIndic = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    const easternArabic = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return str
      .split('')
      .map((c) => {
        const idxA = arabicIndic.indexOf(c);
        if (idxA !== -1) return String(idxA);
        const idxE = easternArabic.indexOf(c);
        if (idxE !== -1) return String(idxE);
        return c;
      })
      .join('')
      .replace(/[^0-9]/g, '')
      .slice(0, 4);
  }

  async joinByCode(rawCode, customHostIp, targetSlotIndex = null) {
    if (!rawCode) return false;
    const cleanCode = this.normalizeRoomCode(rawCode);
    if (cleanCode.length !== 4) return false;

    this.role = 'client';
    this.roomCode = cleanCode;
    this.pendingSlotIndex = targetSlotIndex;
    this.connected = false;

    // Check if any discovered room matches this code
    const matchingRoom = (this.discoveredRooms || []).find(
      (r) => this.normalizeRoomCode(r.roomCode) === cleanCode
    );
    const chosenIp = (matchingRoom && matchingRoom.ip)
      ? matchingRoom.ip
      : (customHostIp && customHostIp.trim() ? customHostIp.trim() : null);

    let isReady = false;
    if (this.ws && this.ws.readyState === WebSocket.OPEN && (!chosenIp || this.targetHostIp === chosenIp)) {
      isReady = true;
    } else {
      isReady = await this.scanAndConnectHost(chosenIp);
    }

    if (isReady) {
      this.sendWs({
        type: 'JOIN_ROOM',
        roomCode: cleanCode,
        clientName: this.myName,
        targetSlotIndex,
      });
    }

    // Cloud Relay Join (Online anywhere / Mobile 4G / Wi-Fi)
    try {
      cloudRelay.joinRoom(cleanCode, {
        clientName: this.myName,
        targetSlotIndex,
      });
    } catch (e) {
      console.warn('CloudRelay join error:', e);
    }

    // BroadcastChannel fallback
    this.sendLocal({
      type: 'ROOM_CONNECT_REQ',
      roomCode: cleanCode,
      clientName: this.myName,
      targetSlotIndex,
      senderId: this.instanceId,
    });

    if (this.joinRetryTimers) {
      this.joinRetryTimers.forEach((t) => clearTimeout(t));
    }
    this.joinRetryTimers = [];

    const t1 = setTimeout(() => {
      if (!this.connected && this.role === 'client' && this.roomCode === cleanCode) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.sendWs({
            type: 'JOIN_ROOM',
            roomCode: cleanCode,
            clientName: this.myName,
            targetSlotIndex,
          });
        } else {
          this.scanAndConnectHost(chosenIp).then((ok) => {
            if (ok) {
              this.sendWs({
                type: 'JOIN_ROOM',
                roomCode: cleanCode,
                clientName: this.myName,
                targetSlotIndex,
              });
            }
          });
        }
        this.sendLocal({
          type: 'ROOM_CONNECT_REQ',
          roomCode: cleanCode,
          clientName: this.myName,
          targetSlotIndex,
          senderId: this.instanceId,
        });
      }
    }, 600);

    const t2 = setTimeout(() => {
      if (!this.connected && this.role === 'client' && this.roomCode === cleanCode) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.sendWs({
            type: 'JOIN_ROOM',
            roomCode: cleanCode,
            clientName: this.myName,
            targetSlotIndex,
          });
        }
      }
    }, 1400);

    this.joinRetryTimers.push(t1, t2);
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
      if (msg.gameMode) this.gameMode = msg.gameMode;
      if (msg.slots) this.tagSlots = msg.slots;
      if (msg.settings) this.tagSettings = msg.settings;
      this.notifyStatus();
    }

    // 2. Error joining room (room code invalid or host offline)
    else if (msg.type === 'ROOM_ERROR') {
      // If retry timer is active, wait for retries before notifying error
      if (this.role === 'client' && this.joinRetryTimers && this.joinRetryTimers.length > 0) {
        this.lastRoomError = msg.message || 'كود الروم مش مظبوط أو صاحب الروم قفل أو مش متصل دلوقتي، اتأكد من الكود يا وحش وجرب تاني!';
        return;
      }
      this.connected = false;
      this.peerName = '';
      this.notifyStatus();
      alert(msg.message || 'كود الروم مش مظبوط أو صاحب الروم قفل أو مش متصل دلوقتي، اتأكد من الكود يا وحش وجرب تاني!');
    }

    // 3. Both Host and Client connected!
    else if (msg.type === 'ROOM_CONNECTED') {
      if (this.joinRetryTimers) {
        this.joinRetryTimers.forEach((t) => clearTimeout(t));
        this.joinRetryTimers = [];
      }
      this.lastRoomError = null;
      this.stopRoomPolling();
      this.connected = true;
      if (msg.transport) {
        this.transport = msg.transport;
      }
      if (msg.gameMode) this.gameMode = msg.gameMode;
      if (msg.settings) this.tagSettings = msg.settings;
      if (msg.slots) this.tagSlots = msg.slots;
      if (typeof msg.mySlot === 'number') this.mySlot = msg.mySlot;
      if (typeof msg.myTeam === 'number') this.myTeam = msg.myTeam;

      if (this.gameMode === 'tag_2v2') {
        const teammateSlot = this.myTeam === 0 ? (this.mySlot === 0 ? 1 : 0) : (this.mySlot === 2 ? 3 : 2);
        this.teammateName = this.tagSlots[teammateSlot]?.name || 'الزميل';
        const opponentLeaderSlot = this.myTeam === 0 ? 2 : 0;
        this.peerName = this.tagSlots[opponentLeaderSlot]?.name || 'فريق الخصم';
      } else {
        if (this.role === 'host') {
          this.peerName = msg.clientName || 'المنافس';
        } else {
          this.peerName = msg.hostName || 'المستضيف';
        }
      }

      this.send({ type: 'HANDSHAKE_ACK', from: this.role, timestamp: Date.now() });
      this.roomCode = msg.roomCode;
      this.startHeartbeat();
      this.notifyStatus();
    }

    // 3.2 Tag Room Slots Updated
    else if (msg.type === 'TAG_ROOM_SLOTS_UPDATED') {
      this.connected = true;
      if (msg.slots) this.tagSlots = msg.slots;
      if (msg.settings) this.tagSettings = msg.settings;
      if (this.gameMode === 'tag_2v2') {
        const teammateSlot = this.myTeam === 0 ? (this.mySlot === 0 ? 1 : 0) : (this.mySlot === 2 ? 3 : 2);
        if (this.tagSlots[teammateSlot]) {
          this.teammateName = this.tagSlots[teammateSlot].name;
        }
        const oppSlot = this.myTeam === 0 ? 2 : 0;
        if (this.tagSlots[oppSlot]) {
          this.peerName = this.tagSlots[oppSlot].name;
        }
      }
      this.notifyStatus();
      this.dispatchMessage(msg);
    }

    // 3.25 My Slot or Team Updated after Swap
    else if (msg.type === 'TAG_MY_SLOT_UPDATED') {
      if (typeof msg.mySlot === 'number') this.mySlot = msg.mySlot;
      if (typeof msg.myTeam === 'number') this.myTeam = msg.myTeam;
      if (this.gameMode === 'tag_2v2' && this.tagSlots && this.tagSlots.length === 4) {
        const teammateSlot = this.myTeam === 0 ? (this.mySlot === 0 ? 1 : 0) : (this.mySlot === 2 ? 3 : 2);
        if (this.tagSlots[teammateSlot]) {
          this.teammateName = this.tagSlots[teammateSlot].name;
        }
        const oppSlot = this.myTeam === 0 ? 2 : 0;
        if (this.tagSlots[oppSlot]) {
          this.peerName = this.tagSlots[oppSlot].name;
        }
      }
      this.notifyStatus();
      this.dispatchMessage(msg);
    }

    // 3.26 Tag Swap Slots received from peer or host
    else if (msg.type === 'TAG_SWAP_SLOTS') {
      if (this.tagSlots && this.tagSlots.length === 4) {
        const slots = [...this.tagSlots];
        const temp = slots[msg.fromSlot];
        slots[msg.fromSlot] = slots[msg.toSlot];
        slots[msg.toSlot] = temp;
        slots[msg.fromSlot].slotIndex = msg.fromSlot;
        slots[msg.fromSlot].team = msg.fromSlot < 2 ? 0 : 1;
        slots[msg.toSlot].slotIndex = msg.toSlot;
        slots[msg.toSlot].team = msg.toSlot < 2 ? 0 : 1;
        this.tagSlots = slots;

        if (this.mySlot === msg.fromSlot) {
          this.mySlot = msg.toSlot;
          this.myTeam = msg.toSlot < 2 ? 0 : 1;
        } else if (this.mySlot === msg.toSlot) {
          this.mySlot = msg.fromSlot;
          this.myTeam = msg.fromSlot < 2 ? 0 : 1;
        }

        const teammateSlot = this.myTeam === 0 ? (this.mySlot === 0 ? 1 : 0) : (this.mySlot === 2 ? 3 : 2);
        if (this.tagSlots[teammateSlot]) {
          this.teammateName = this.tagSlots[teammateSlot].name;
        }
        const oppSlot = this.myTeam === 0 ? 2 : 0;
        if (this.tagSlots[oppSlot]) {
          this.peerName = this.tagSlots[oppSlot].name;
        }

        this.notifyStatus();
        this.dispatchMessage(msg);

        if (this.role === 'host') {
          this.send({
            type: 'TAG_ROOM_SLOTS_UPDATED',
            slots: this.tagSlots,
            settings: this.tagSettings,
          });
        }
      }
    }

    // 3.3 Tag Room Settings Updated
    else if (msg.type === 'TAG_ROOM_SETTINGS_UPDATED') {
      if (msg.settings) this.tagSettings = { ...this.tagSettings, ...msg.settings };
      this.notifyStatus();
      this.dispatchMessage(msg);
    }

    // 3.4 Team Ping
    else if (msg.type === 'TEAM_PING') {
      this.dispatchMessage(msg);
    }

    // 3.5 Tag Sync Hand (from Teammate)
    else if (msg.type === 'TAG_SYNC_HAND') {
      if (msg.team === this.myTeam && msg.senderSlot !== this.mySlot) {
        this.teammateHand = msg.handCards || [];
        this.notifyStatus();
      }
      this.dispatchMessage(msg);
    }

    // 3.6 Handshake ACK received
    else if (msg.type === 'HANDSHAKE_ACK') {
      if (msg.timestamp) {
        this.latencyMs = Math.max(1, Math.min(999, Math.round((Date.now() - msg.timestamp) / 2)));
      }
      this.notifyStatus();
      this.dispatchMessage(msg);
    }

    // 4. List of active rooms from server
    else if (msg.type === 'ACTIVE_ROOMS_LIST') {
      const incoming = Array.isArray(msg.rooms) ? msg.rooms : [];
      const map = new Map();
      for (const r of (this.discoveredRooms || [])) {
        if (r && r.roomCode) {
          map.set(this.normalizeRoomCode(r.roomCode), r);
        }
      }
      for (const r of incoming) {
        if (r && r.roomCode) {
          const code = this.normalizeRoomCode(r.roomCode);
          const prev = map.get(code) || {};
          map.set(code, { ...prev, ...r, roomCode: code, lastSeen: Date.now() });
        }
      }
      this.discoveredRooms = Array.from(map.values());
      this.notifyStatus();
    }

    // 5. Start duel signal from peer
    else if (msg.type === 'START_DUEL' || msg.type === 'DUEL_COUNTDOWN_START') {
      if (msg.seed) {
        this.matchSeed = msg.seed;
      }
      if (msg.slots) this.tagSlots = msg.slots;
      if (msg.settings) this.tagSettings = msg.settings;
      this.dispatchMessage(msg);
    }

    // 6. Duel action, tag sync field, janken, or surrender
    else if (
      msg.type === 'DUEL_ACTION' ||
      msg.type === 'TAG_SYNC_FIELD' ||
      msg.type === 'SURRENDER' ||
      (typeof msg.type === 'string' && msg.type.startsWith('JANKEN_'))
    ) {
      this.dispatchMessage(msg);
    }

    // 7. Peer disconnected
    else if (msg.type === 'PEER_DISCONNECTED') {
      this.stopHeartbeat();
      alert(msg.reason || 'الاتصال مع المنافس اتقطع يا غالي، ارجع وجرب تدخل تاني.');
      this.connected = false;
      this.peerName = '';
      this.notifyStatus();
    } else {
      // Fallback: Dispatch any custom tag/duel action
      this.dispatchMessage(msg);
    }
  }

  handleCloudRelayMessage(topic, msg) {
    if (!msg || !msg.type) return;

    // Deduplicate identical packets
    const msgKey = msg.msgId || (msg.type + '_' + (msg.timestamp || '') + '_' + (msg.senderSlot ?? ''));
    if (this.seenMessageIds.has(msgKey)) return;
    this.seenMessageIds.add(msgKey);
    if (this.seenMessageIds.size > 250) {
      const first = this.seenMessageIds.values().next().value;
      this.seenMessageIds.delete(first);
    }

    if (msg.type === 'JOIN_REQ' && this.role === 'host' && !this.connected) {
      if (this.gameMode === 'tag_2v2') {
        const clientName = msg.clientName || 'الزميل';
        this.teammateName = clientName;
        let slots = this.tagSlots && this.tagSlots.length === 4 ? [...this.tagSlots] : [
          { slotIndex: 0, team: 0, isOccupied: true, isHost: true, isBot: false, name: this.myName },
          { slotIndex: 1, team: 0, isOccupied: true, isHost: false, isBot: false, name: clientName },
          { slotIndex: 2, team: 1, isOccupied: true, isHost: false, isBot: true, name: 'سيتو كايبا (بوت)', botDifficulty: 'normal' },
          { slotIndex: 3, team: 1, isOccupied: true, isHost: false, isBot: true, name: 'يامي ماريك (بوت)', botDifficulty: 'normal' },
        ];
        slots[1] = { slotIndex: 1, team: 0, isOccupied: true, isHost: false, isBot: false, name: clientName };
        this.tagSlots = slots;
        this.peerName = slots[2]?.name || 'سيتو كايبا (بوت)';
        this.connected = true;
        this.transport = 'cloud_relay';
        this.notifyStatus();

        cloudRelay.publish(`yugioh/rooms/${this.roomCode}/match`, {
          type: 'ROOM_CONNECTED',
          roomCode: this.roomCode,
          gameMode: 'tag_2v2',
          mySlot: 1,
          myTeam: 0,
          hostName: this.myName,
          clientName: clientName,
          slots: slots,
          settings: this.tagSettings,
          transport: 'cloud_relay',
          timestamp: Date.now(),
        });
      } else {
        this.peerName = msg.clientName || 'المنافس';
        this.connected = true;
        this.transport = 'cloud_relay';
        this.notifyStatus();

        cloudRelay.publish(`yugioh/rooms/${this.roomCode}/match`, {
          type: 'ROOM_CONNECTED',
          roomCode: this.roomCode,
          gameMode: '1v1',
          hostName: this.myName,
          clientName: this.peerName,
          transport: 'cloud_relay',
          timestamp: Date.now(),
        });
      }
    } else if (msg.type === 'ROOM_CONNECTED' && this.role === 'client' && !this.connected) {
      if (this.roomCode && this.normalizeRoomCode(msg.roomCode) === this.normalizeRoomCode(this.roomCode)) {
        if (this.joinRetryTimers) {
          this.joinRetryTimers.forEach((t) => clearTimeout(t));
          this.joinRetryTimers = [];
        }
        this.lastRoomError = null;
        this.connected = true;
        this.gameMode = msg.gameMode || '1v1';
        if (this.gameMode === 'tag_2v2') {
          this.mySlot = typeof msg.mySlot === 'number' ? msg.mySlot : 1;
          this.myTeam = typeof msg.myTeam === 'number' ? msg.myTeam : 0;
          this.tagSlots = msg.slots || [];
          this.tagSettings = msg.settings || this.tagSettings;
          this.teammateName = msg.hostName || 'المستضيف';
          this.peerName = msg.slots?.[2]?.name || 'سيتو كايبا (بوت)';
        } else {
          this.peerName = msg.hostName || 'المستضيف';
        }
        this.transport = 'cloud_relay';
        this.notifyStatus();
      }
    } else {
      this.handleServerMessage(msg);
    }
  }

  handleLocalMessage(msg) {
    // Local fallback for dual tabs on same browser
    if (msg.type === 'ROOM_CONNECT_REQ' && this.role === 'host' && !this.connected) {
      if (msg.roomCode === this.roomCode) {
        this.connected = true;
        if (this.gameMode === 'tag_2v2') {
          const clientName = msg.clientName || 'الزميل';
          this.teammateName = clientName;
          let slots = this.tagSlots && this.tagSlots.length === 4 ? [...this.tagSlots] : [
            { slotIndex: 0, team: 0, isOccupied: true, isHost: true, isBot: false, name: this.myName },
            { slotIndex: 1, team: 0, isOccupied: true, isHost: false, isBot: false, name: clientName },
            { slotIndex: 2, team: 1, isOccupied: true, isHost: false, isBot: true, name: 'سيتو كايبا (بوت)', botDifficulty: 'normal' },
            { slotIndex: 3, team: 1, isOccupied: true, isHost: false, isBot: true, name: 'يامي ماريك (بوت)', botDifficulty: 'normal' },
          ];
          slots[1] = { slotIndex: 1, team: 0, isOccupied: true, isHost: false, isBot: false, name: clientName };
          this.tagSlots = slots;
          this.peerName = slots[2]?.name || 'سيتو كايبا (بوت)';
          this.notifyStatus();
          this.sendLocal({
            type: 'ROOM_CONNECTED_LOCAL',
            roomCode: this.roomCode,
            gameMode: 'tag_2v2',
            mySlot: 1,
            myTeam: 0,
            hostName: this.myName,
            clientName: clientName,
            slots: slots,
            settings: this.tagSettings,
            transport: this.transport,
          });
        } else {
          this.peerName = msg.clientName || 'المنافس';
          this.notifyStatus();
          this.sendLocal({
            type: 'ROOM_CONNECTED_LOCAL',
            roomCode: this.roomCode,
            gameMode: '1v1',
            hostName: this.myName,
            clientName: this.peerName,
            transport: this.transport,
          });
        }
      }
    } else if (msg.type === 'ROOM_CONNECTED_LOCAL' && this.role === 'client' && !this.connected) {
      if (msg.roomCode === this.roomCode) {
        if (this.joinRetryTimers) {
          this.joinRetryTimers.forEach((t) => clearTimeout(t));
          this.joinRetryTimers = [];
        }
        this.lastRoomError = null;
        this.connected = true;
        this.gameMode = msg.gameMode || '1v1';
        if (this.gameMode === 'tag_2v2') {
          this.mySlot = typeof msg.mySlot === 'number' ? msg.mySlot : 1;
          this.myTeam = typeof msg.myTeam === 'number' ? msg.myTeam : 0;
          this.tagSlots = msg.slots || [];
          this.tagSettings = msg.settings || this.tagSettings;
          this.teammateName = msg.hostName || 'المستضيف (زميلك)';
          this.peerName = msg.slots?.[2]?.name || 'سيتو كايبا (بوت)';
        } else {
          this.peerName = msg.hostName || 'المستضيف';
        }
        if (msg.transport) this.transport = msg.transport;
        this.notifyStatus();
      }
    } else if (msg.type === 'TAG_SWAP_SLOTS') {
      const { fromSlot, toSlot } = msg;
      if (
        typeof fromSlot === 'number' &&
        typeof toSlot === 'number' &&
        this.tagSlots &&
        this.tagSlots.length === 4
      ) {
        const slots = [...this.tagSlots];
        const temp = slots[fromSlot];
        slots[fromSlot] = slots[toSlot];
        slots[toSlot] = temp;
        slots[fromSlot].slotIndex = fromSlot;
        slots[fromSlot].team = fromSlot < 2 ? 0 : 1;
        slots[toSlot].slotIndex = toSlot;
        slots[toSlot].team = toSlot < 2 ? 0 : 1;
        this.tagSlots = slots;
        if (this.mySlot === fromSlot) {
          this.mySlot = toSlot;
          this.myTeam = toSlot < 2 ? 0 : 1;
        } else if (this.mySlot === toSlot) {
          this.mySlot = fromSlot;
          this.myTeam = fromSlot < 2 ? 0 : 1;
        }
        this.notifyStatus();
      }
    } else if (
      msg.type === 'START_DUEL' ||
      msg.type === 'DUEL_COUNTDOWN_START' ||
      msg.type === 'DUEL_ACTION' ||
      msg.type === 'TAG_SYNC_FIELD' ||
      msg.type === 'SURRENDER' ||
      msg.type === 'TEAM_PING' ||
      msg.type === 'TAG_SYNC_HAND' ||
      (typeof msg.type === 'string' && msg.type.startsWith('JANKEN_'))
    ) {
      this.dispatchMessage(msg);
    } else {
      this.dispatchMessage(msg);
    }
  }

  send(message) {
    // 1. Send to WebSocket server
    this.sendWs(message);

    // 2. Also send via Cloud Relay
    try {
      cloudRelay.sendGameMessage(message);
    } catch (e) {}

    // 3. Also send to local channel fallback
    this.sendLocal(message);
  }

  broadcast(message) {
    this.send(message);
  }

  async cancel() {
    if (this.joinRetryTimers) {
      this.joinRetryTimers.forEach((t) => clearTimeout(t));
      this.joinRetryTimers = [];
    }
    this.lastRoomError = null;
    this.stopHeartbeat();
    this.stopRoomPolling();
    try {
      cloudRelay.stopAnnouncing();
      cloudRelay.destroy();
    } catch (e) {}
    if (this.role === 'host' && this.roomCode) {
      this.sendWs({ type: 'CLOSE_ROOM', roomCode: this.roomCode });
    }
    if (this.isNative) {
      try {
        LocalServer.stopDiscovery();
        LocalServer.stopAnnouncing();
      } catch (e) {}
      if (this.role === 'host') {
        try {
          await LocalServer.stopServer();
        } catch (e) {}
      }
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    this.role = null;
    this.connected = false;
    this.peerName = '';
    this.teammateName = '';
    this.teammateHand = [];
    this.tagSlots = [];
    this.roomCode = null;
    this.currentWsUrl = null;
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
      gameMode: this.gameMode,
      mySlot: this.mySlot,
      myTeam: this.myTeam,
      tagSlots: this.tagSlots,
      tagSettings: this.tagSettings,
      teammateName: this.teammateName,
      teammateHand: this.teammateHand,
      peerName: this.peerName || '',
      myName: this.myName || '',
      roomCode: this.roomCode || null,
      discoveredRooms: Array.isArray(this.discoveredRooms) ? this.discoveredRooms : [],
      isBroadcasting: this.role === 'host' && !this.connected,
      ipOrDevice: this.localServerIp || hostname,
      targetHostIp: this.targetHostIp,
      latencyMs: this.latencyMs || 1,
      bluetoothSupported: this.isWebBluetoothSupported(),
      bluetoothDevice: this.bluetoothDevice,
      isNative: this.isNative,
      peerOnHotspot: !!this.peerOnHotspot,
      hotspotStatus: this.hotspotStatus || null,
    };
  }

  notifyStatus() {
    const status = this.getStatus();
    for (const cb of this.statusListeners) {
      cb(status);
    }
  }

  startLobbyDiscovery() {
    if (this.lobbyDiscoveryActive) return;
    this.lobbyDiscoveryActive = true;

    // 1. In native Android, start continuous UDP discovery listener
    if (this.isNative) {
      try {
        LocalServer.startDiscovery();
      } catch (e) {}
    }

    // 2. Poll Hotspot and candidate gateways every 2.5 seconds
    const checkHotspot = async () => {
      if (!this.lobbyDiscoveryActive || this.connected) return;

      if (this.isNative) {
        try {
          const hs = await LocalServer.checkHotspotStatus();
          if (hs) {
            this.hotspotStatus = hs;
            const hasPeers = (hs.peerCount > 0) || (hs.isHotspotHost && hs.peers && hs.peers.length > 0);
            if (this.peerOnHotspot !== hasPeers) {
              this.peerOnHotspot = hasPeers;
              this.notifyStatus();
            }

            // If we are a client connected to a hotspot, probe the hotspot host server directly
            if (hs.isHotspotClient || hs.gatewayIp === '192.168.43.1') {
              this.probeHotspotServer(hs.gatewayIp || '192.168.43.1');
            }
          }
        } catch (e) {}
      } else {
        // In browser / dev server, query active rooms
        this.sendWs({ type: 'GET_ACTIVE_ROOMS' });
      }
    };

    checkHotspot();
    this.hotspotCheckInterval = setInterval(checkHotspot, 2500);
  }

  async probeHotspotServer(ip = '192.168.43.1') {
    if (this.connected || this.role === 'host') return;
    try {
      const probeWs = new WebSocket(`ws://${ip}:9001/yugioh-ws`);
      probeWs.onopen = () => {
        probeWs.send(JSON.stringify({ type: 'GET_ACTIVE_ROOMS' }));
      };
      probeWs.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'ACTIVE_ROOMS_LIST' && Array.isArray(msg.rooms)) {
            const list = Array.isArray(this.discoveredRooms) ? [...this.discoveredRooms] : [];
            for (const r of msg.rooms) {
              const code = this.normalizeRoomCode(r.roomCode);
              const idx = list.findIndex((x) => this.normalizeRoomCode(x.roomCode) === code);
              const enriched = {
                ...r,
                roomCode: code,
                ip: ip,
                isHotspotDirect: true,
                lastSeen: Date.now(),
                transport: 'hotspot_direct',
              };
              if (idx !== -1) {
                list[idx] = { ...list[idx], ...enriched };
              } else {
                list.unshift(enriched); // Hotspot rooms at the VERY TOP
              }
            }
            this.discoveredRooms = list;
            this.notifyStatus();
          }
        } catch (e) {}
        try { probeWs.close(); } catch (e) {}
      };
      probeWs.onerror = () => {
        try { probeWs.close(); } catch (e) {}
      };
      setTimeout(() => {
        try { probeWs.close(); } catch (e) {}
      }, 1500);
    } catch (e) {}
  }

  stopLobbyDiscovery() {
    this.lobbyDiscoveryActive = false;
    if (this.hotspotCheckInterval) {
      clearInterval(this.hotspotCheckInterval);
      this.hotspotCheckInterval = null;
    }
  }

  disconnect() {
    this.cancel();
  }
}

export const connectionManager = new ConnectionManager();
