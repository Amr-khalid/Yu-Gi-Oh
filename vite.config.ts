import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { WebSocketServer, WebSocket } from 'ws';

// High-performance Local Network Multiplayer Relay Plugin for Yu-Gi-Oh!
function yugiohMultiplayerPlugin() {
  // roomCode -> { hostWs, clientWs, hostName, clientName, roomCode, createdAt }
  const rooms = new Map();

  return {
    name: 'yugioh-multiplayer-relay',
    configureServer(server) {
      if (!server.httpServer) return;

      const wss = new WebSocketServer({ noServer: true });

      function broadcastActiveRooms() {
        const active = [];
        const now = Date.now();
        for (const [code, r] of rooms.entries()) {
          if (r.hostWs && r.hostWs.readyState === WebSocket.OPEN && !r.clientWs && now - r.createdAt < 600000) {
            active.push({
              roomCode: code,
              hostName: r.hostName,
              transport: r.transport || 'wifi',
              createdAt: r.createdAt,
            });
          }
        }
        const payload = JSON.stringify({ type: 'ACTIVE_ROOMS_LIST', rooms: active });
        for (const client of wss.clients) {
          if (client.readyState === WebSocket.OPEN) {
            try {
              client.send(payload);
            } catch (e) {}
          }
        }
      }

      server.httpServer.on('upgrade', (request, socket, head) => {
        try {
          const hostHeader = request.headers.host || 'localhost:3000';
          const url = new URL(request.url || '', `http://${hostHeader}`);
          if (url.pathname === '/yugioh-ws') {
            wss.handleUpgrade(request, socket, head, (ws) => {
              wss.emit('connection', ws, request);
            });
          }
        } catch (e) {
          console.error('WS upgrade error:', e);
        }
      });

      wss.on('connection', (ws) => {
        let currentRoomCode = null;
        let isHost = false;

        // Immediately push current active rooms to newcomer
        const initialActive = [];
        const now = Date.now();
        for (const [code, r] of rooms.entries()) {
          if (r.hostWs && r.hostWs.readyState === WebSocket.OPEN && !r.clientWs && now - r.createdAt < 600000) {
            initialActive.push({
              roomCode: code,
              hostName: r.hostName,
              transport: r.transport || 'wifi',
              createdAt: r.createdAt,
            });
          }
        }
        try {
          ws.send(JSON.stringify({ type: 'ACTIVE_ROOMS_LIST', rooms: initialActive }));
        } catch (e) {}

        ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString());

            // 0. Latency Ping-Pong Check
            if (msg.type === 'PING') {
              ws.send(JSON.stringify({ type: 'PONG', clientTime: msg.timestamp, serverTime: Date.now() }));
              return;
            }

            // 1. Host creates a room with 4-digit code (1v1 or Tag 2v2)
            if (msg.type === 'CREATE_ROOM') {
              const code = String(msg.roomCode || '').replace(/[^0-9]/g, '').trim();
              currentRoomCode = code;
              isHost = true;
              const gameMode = msg.gameMode || '1v1';

              const sanitizeSlots = (slots) => slots.map((s) => ({
                slotIndex: s.slotIndex,
                team: s.team,
                isOccupied: s.isOccupied,
                isHost: s.isHost,
                isBot: s.isBot,
                name: s.name,
                botDifficulty: s.botDifficulty,
              }));

              // If this room already exists (e.g. host reconnected after network blip), reclaim it!
              const existing = rooms.get(code);
              if (existing) {
                if (existing.cleanupTimeout) {
                  clearTimeout(existing.cleanupTimeout);
                  existing.cleanupTimeout = null;
                }
                existing.hostWs = ws;
                existing.hostName = msg.hostName || existing.hostName;
                existing.transport = msg.transport || existing.transport;
                existing.gameMode = gameMode;
                if (msg.settings) existing.settings = { ...existing.settings, ...msg.settings };
                if (existing.slots && existing.slots[0]) {
                  existing.slots[0].ws = ws;
                  existing.slots[0].name = existing.hostName;
                }
                rooms.set(code, existing);

                ws.send(JSON.stringify({
                  type: 'ROOM_CREATED',
                  roomCode: code,
                  hostName: existing.hostName,
                  transport: existing.transport || 'wifi',
                  gameMode,
                  settings: existing.settings,
                  slots: sanitizeSlots(existing.slots),
                }));

                broadcastActiveRooms();
                return;
              }

              const defaultSettings = {
                lifePoints: 16000,
                summonRule: 'per_player', // 'per_player' | 'team_shared'
                graveyardShare: true,
                turnTimer: 90,
                teammateHandVisibility: 'visible', // 'visible' | 'hidden'
              };

              const roomObj = {
                hostWs: ws,
                clientWs: null,
                hostName: msg.hostName || 'المستضيف',
                clientName: null,
                roomCode: code,
                transport: msg.transport || 'wifi',
                createdAt: Date.now(),
                gameMode,
                settings: { ...defaultSettings, ...(msg.settings || {}) },
                slots: [
                  { slotIndex: 0, team: 0, isOccupied: true, isHost: true, isBot: false, name: msg.hostName || 'قائد الفريق الذهبي', ws },
                  { slotIndex: 1, team: 0, isOccupied: false, isHost: false, isBot: false, name: 'شاغر (انضمام أو بوت)', botDifficulty: 'normal', ws: null },
                  { slotIndex: 2, team: 1, isOccupied: false, isHost: false, isBot: false, name: 'شاغر (انضمام أو بوت)', botDifficulty: 'normal', ws: null },
                  { slotIndex: 3, team: 1, isOccupied: false, isHost: false, isBot: false, name: 'شاغر (انضمام أو بوت)', botDifficulty: 'normal', ws: null },
                ],
              };

              rooms.set(code, roomObj);

              ws.send(JSON.stringify({
                type: 'ROOM_CREATED',
                roomCode: code,
                hostName: msg.hostName || 'المستضيف',
                transport: msg.transport || 'wifi',
                gameMode,
                settings: roomObj.settings,
                slots: sanitizeSlots(roomObj.slots),
              }));

              // Instantly broadcast new room availability to all waiting devices
              broadcastActiveRooms();
            }

            // 2. Client joins with 4-digit code
            else if (msg.type === 'JOIN_ROOM') {
              const code = String(msg.roomCode || '').replace(/[^0-9]/g, '').trim();
              let room = rooms.get(code);

              if (!room) {
                // Fallback scan in case code in map had any formatting
                for (const [k, r] of rooms.entries()) {
                  if (String(k).replace(/[^0-9]/g, '') === code) {
                    room = r;
                    break;
                  }
                }
              }

              if (!room || !room.hostWs || room.hostWs.readyState !== WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'ROOM_ERROR',
                  message: 'كود الروم مش مظبوط أو صاحب الروم قفل أو مش متصل دلوقتي، اتأكد من الكود يا وحش وجرب تاني!',
                }));
                return;
              }

              const sanitizeSlots = (slots) => slots.map((s) => ({
                slotIndex: s.slotIndex,
                team: s.team,
                isOccupied: s.isOccupied,
                isHost: s.isHost,
                isBot: s.isBot,
                name: s.name,
                botDifficulty: s.botDifficulty,
              }));

              // Handle Tag 2v2 Mode Room Join
              if (room.gameMode === 'tag_2v2') {
                let targetSlotIndex = -1;
                if (typeof msg.targetSlotIndex === 'number' && msg.targetSlotIndex >= 1 && msg.targetSlotIndex <= 3) {
                  const reqSlot = room.slots[msg.targetSlotIndex];
                  if (reqSlot && !reqSlot.isOccupied && !reqSlot.isBot) {
                    targetSlotIndex = msg.targetSlotIndex;
                  }
                }
                if (targetSlotIndex === -1) {
                  targetSlotIndex = room.slots.findIndex((s) => !s.isOccupied && !s.isBot && !s.isHost);
                }

                if (targetSlotIndex === -1) {
                  ws.send(JSON.stringify({
                    type: 'ROOM_ERROR',
                    message: 'الروم دي مفولة بالكامل بـ 4 لاعبين، اختار روم تانية يا بطل!',
                  }));
                  return;
                }

                currentRoomCode = code;
                isHost = false;
                const assignedTeam = targetSlotIndex < 2 ? 0 : 1;
                const clientName = msg.clientName || ('المبارز ' + (targetSlotIndex + 1));

                room.slots[targetSlotIndex] = {
                  ...room.slots[targetSlotIndex],
                  isOccupied: true,
                  isHost: false,
                  isBot: false,
                  name: clientName,
                  ws,
                };

                const cleanSlots = sanitizeSlots(room.slots);

                // Notify joining player
                ws.send(JSON.stringify({
                  type: 'ROOM_CONNECTED',
                  roomCode: code,
                  gameMode: 'tag_2v2',
                  mySlot: targetSlotIndex,
                  myTeam: assignedTeam,
                  hostName: room.hostName,
                  clientName,
                  transport: room.transport || 'wifi',
                  settings: room.settings,
                  slots: cleanSlots,
                  connectedAt: Date.now(),
                }));

                // Broadcast updated slots to all connected sockets in room
                const updatePayload = JSON.stringify({
                  type: 'TAG_ROOM_SLOTS_UPDATED',
                  roomCode: code,
                  slots: cleanSlots,
                  settings: room.settings,
                });
                for (const s of room.slots) {
                  if (s.ws && s.ws.readyState === WebSocket.OPEN) {
                    try {
                      s.ws.send(updatePayload);
                    } catch (e) {}
                  }
                }

                broadcastActiveRooms();
                return;
              }

              // Standard 1v1 Mode Room Join
              if (room.clientWs && room.clientWs !== ws && room.clientWs.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'ROOM_ERROR',
                  message: 'الروم دي فيها اتنين بيلعبوا خلاص ومفولة يا صاحبي!',
                }));
                return;
              }

              currentRoomCode = code;
              isHost = false;
              room.clientWs = ws;
              room.clientName = msg.clientName || 'المنافس';

              // Notify both Host and Client simultaneously
              const matchPayload = {
                type: 'ROOM_CONNECTED',
                roomCode: code,
                gameMode: '1v1',
                hostName: room.hostName,
                clientName: room.clientName,
                transport: room.transport || 'wifi',
                connectedAt: Date.now(),
              };

              try {
                room.hostWs.send(JSON.stringify(matchPayload));
                room.clientWs.send(JSON.stringify(matchPayload));
              } catch (e) {
                console.error('Error sending ROOM_CONNECTED:', e);
              }

              // Update room availability for all browsers
              broadcastActiveRooms();
            }

            // 2.2 Host updates a 2v2 slot (Set as Bot, Clear Bot, Kick player)
            else if (msg.type === 'TAG_UPDATE_SLOT') {
              const room = rooms.get(currentRoomCode);
              if (room && room.gameMode === 'tag_2v2' && isHost) {
                const { slotIndex, isBot, botDifficulty, botName } = msg;
                if (slotIndex >= 1 && slotIndex <= 3) {
                  const targetSlot = room.slots[slotIndex];
                  // If kicking human player
                  if (targetSlot && targetSlot.ws && targetSlot.ws !== ws && targetSlot.ws.readyState === WebSocket.OPEN) {
                    try {
                      targetSlot.ws.send(JSON.stringify({
                        type: 'PEER_DISCONNECTED',
                        reason: 'قام المستضيف بتغيير هذه الخانة إلى بوت أو تفريغها.',
                      }));
                    } catch (e) {}
                  }

                  room.slots[slotIndex] = {
                    ...targetSlot,
                    isOccupied: !!isBot,
                    isBot: !!isBot,
                    botDifficulty: botDifficulty || 'normal',
                    name: isBot ? (botName || `بوت ${botDifficulty === 'hard' ? 'أسطوري' : 'ذكي'} (${slotIndex < 2 ? 'زميل' : 'خصم'})`) : 'شاغر (انضمام أو بوت)',
                    ws: null,
                  };

                  const cleanSlots = room.slots.map((s) => ({
                    slotIndex: s.slotIndex,
                    team: s.team,
                    isOccupied: s.isOccupied,
                    isHost: s.isHost,
                    isBot: s.isBot,
                    name: s.name,
                    botDifficulty: s.botDifficulty,
                  }));

                  const payload = JSON.stringify({
                    type: 'TAG_ROOM_SLOTS_UPDATED',
                    roomCode: currentRoomCode,
                    slots: cleanSlots,
                    settings: room.settings,
                  });

                  for (const s of room.slots) {
                    if (s.ws && s.ws.readyState === WebSocket.OPEN) {
                      try {
                        s.ws.send(payload);
                      } catch (e) {}
                    }
                  }
                  broadcastActiveRooms();
                }
              }
            }

            // 2.25 Swap or Move Slots in 2v2 Tag Room
            else if (msg.type === 'TAG_SWAP_SLOTS') {
              const room = rooms.get(currentRoomCode);
              if (room && room.gameMode === 'tag_2v2') {
                const { fromSlot, toSlot } = msg;
                if (
                  typeof fromSlot === 'number' &&
                  typeof toSlot === 'number' &&
                  fromSlot >= 0 && fromSlot <= 3 &&
                  toSlot >= 0 && toSlot <= 3 &&
                  fromSlot !== toSlot
                ) {
                  const reqSlotIdx = room.slots.findIndex((s) => s.ws === ws);
                  if (isHost || reqSlotIdx === fromSlot || reqSlotIdx === toSlot) {
                    const temp = room.slots[fromSlot];
                    room.slots[fromSlot] = room.slots[toSlot];
                    room.slots[toSlot] = temp;

                    room.slots[fromSlot].slotIndex = fromSlot;
                    room.slots[fromSlot].team = fromSlot < 2 ? 0 : 1;
                    room.slots[toSlot].slotIndex = toSlot;
                    room.slots[toSlot].team = toSlot < 2 ? 0 : 1;

                    // Update isHost flag (remains with room host socket)
                    room.slots.forEach((s) => {
                      s.isHost = Boolean(s.ws && s.ws === room.hostWs);
                    });

                    const cleanSlots = sanitizeSlots(room.slots);

                    // Notify each connected socket of their possibly updated slot
                    for (const s of room.slots) {
                      if (s.ws && s.ws.readyState === WebSocket.OPEN) {
                        try {
                          s.ws.send(JSON.stringify({
                            type: 'TAG_MY_SLOT_UPDATED',
                            mySlot: s.slotIndex,
                            myTeam: s.team,
                          }));
                        } catch (e) {}
                      }
                    }

                    // Broadcast new layout to all sockets in room
                    const payload = JSON.stringify({
                      type: 'TAG_ROOM_SLOTS_UPDATED',
                      roomCode: currentRoomCode,
                      slots: cleanSlots,
                      settings: room.settings,
                    });

                    for (const s of room.slots) {
                      if (s.ws && s.ws.readyState === WebSocket.OPEN) {
                        try {
                          s.ws.send(payload);
                        } catch (e) {}
                      }
                    }
                    broadcastActiveRooms();
                  }
                }
              }
            }

            // 2.3 Host updates 2v2 match settings
            else if (msg.type === 'TAG_UPDATE_SETTINGS') {
              const room = rooms.get(currentRoomCode);
              if (room && isHost && msg.settings) {
                room.settings = { ...room.settings, ...msg.settings };
                const payload = JSON.stringify({
                  type: 'TAG_ROOM_SETTINGS_UPDATED',
                  settings: room.settings,
                });
                if (room.gameMode === 'tag_2v2') {
                  for (const s of room.slots) {
                    if (s.ws && s.ws.readyState === WebSocket.OPEN) {
                      try {
                        s.ws.send(payload);
                      } catch (e) {}
                    }
                  }
                }
              }
            }

            // 2.5 Close Room manually by Host
            else if (msg.type === 'CLOSE_ROOM') {
              const code = String(msg.roomCode || currentRoomCode).trim();
              if (code && rooms.has(code)) {
                const room = rooms.get(code);
                if (room) {
                  if (room.gameMode === 'tag_2v2') {
                    for (const s of room.slots) {
                      if (s.ws && s.ws !== ws && s.ws.readyState === WebSocket.OPEN) {
                        try {
                          s.ws.send(JSON.stringify({
                            type: 'PEER_DISCONNECTED',
                            reason: 'قام المستضيف بإغلاق الغرفة.',
                          }));
                        } catch (e) {}
                      }
                    }
                  } else if (room.clientWs && room.clientWs.readyState === WebSocket.OPEN) {
                    try {
                      room.clientWs.send(JSON.stringify({
                        type: 'PEER_DISCONNECTED',
                        reason: 'قام المستضيف بإغلاق الغرفة.',
                      }));
                    } catch (e) {}
                  }
                }
                rooms.delete(code);
                broadcastActiveRooms();
              }
            }

            // 3. Start duel broadcast or Countdown start
            else if (msg.type === 'START_DUEL' || msg.type === 'DUEL_COUNTDOWN_START') {
              const room = rooms.get(currentRoomCode);
              if (room) {
                const payload = JSON.stringify(msg);
                if (room.gameMode === 'tag_2v2') {
                  for (const s of room.slots) {
                    if (s.ws && s.ws.readyState === WebSocket.OPEN) {
                      try {
                        s.ws.send(payload);
                      } catch (e) {}
                    }
                  }
                } else {
                  if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
                    room.hostWs.send(payload);
                  }
                  if (room.clientWs && room.clientWs.readyState === WebSocket.OPEN) {
                    room.clientWs.send(payload);
                  }
                }
              }
            }

            // 4. Duel Action, Janken, Surrender, Team Ping, or Hand Sync
            else if (
              msg.type === 'DUEL_ACTION' ||
              msg.type === 'SURRENDER' ||
              msg.type === 'HANDSHAKE_ACK' ||
              msg.type === 'TEAM_PING' ||
              msg.type === 'TAG_SYNC_HAND' ||
              msg.type === 'TAG_SYNC_FIELD' ||
              (typeof msg.type === 'string' && msg.type.startsWith('JANKEN_'))
            ) {
              const room = rooms.get(currentRoomCode);
              if (room) {
                const payload = JSON.stringify(msg);
                if (room.gameMode === 'tag_2v2') {
                  // Forward to all other sockets in room
                  for (const s of room.slots) {
                    if (s.ws && s.ws !== ws && s.ws.readyState === WebSocket.OPEN) {
                      try {
                        s.ws.send(payload);
                      } catch (e) {}
                    }
                  }
                } else {
                  const target = isHost ? room.clientWs : room.hostWs;
                  if (target && target.readyState === WebSocket.OPEN) {
                    target.send(payload);
                  }
                }
              }
            }

            // 5. Query active rooms list
            else if (msg.type === 'GET_ACTIVE_ROOMS') {
              const active = [];
              const now = Date.now();
              for (const [code, r] of rooms.entries()) {
                if (r.hostWs && r.hostWs.readyState === WebSocket.OPEN && now - r.createdAt < 600000) {
                  if (r.gameMode === 'tag_2v2') {
                    const occupiedCount = r.slots.filter((s) => s.isOccupied || s.isBot).length;
                    active.push({
                      roomCode: code,
                      hostName: r.hostName,
                      gameMode: 'tag_2v2',
                      slotsOccupied: occupiedCount,
                      maxSlots: 4,
                      settings: r.settings,
                      transport: r.transport || 'wifi',
                      createdAt: r.createdAt,
                    });
                  } else if (!r.clientWs) {
                    active.push({
                      roomCode: code,
                      hostName: r.hostName,
                      gameMode: '1v1',
                      slotsOccupied: 1,
                      maxSlots: 2,
                      transport: r.transport || 'wifi',
                      createdAt: r.createdAt,
                    });
                  }
                }
              }
              ws.send(JSON.stringify({ type: 'ACTIVE_ROOMS_LIST', rooms: active }));
            }
          } catch (e) {
            console.error('WS Relay message handling error:', e);
          }
        });

        ws.on('close', () => {
          if (currentRoomCode) {
            const room = rooms.get(currentRoomCode);
            if (room) {
              if (room.gameMode === 'tag_2v2') {
                if (isHost || ws === room.hostWs) {
                  room.hostWs = null;
                  if (room.cleanupTimeout) clearTimeout(room.cleanupTimeout);
                  room.cleanupTimeout = setTimeout(() => {
                    const r = rooms.get(currentRoomCode);
                    if (r && !r.hostWs) {
                      for (const s of r.slots || []) {
                        if (s.ws && s.ws.readyState === WebSocket.OPEN) {
                          try {
                            s.ws.send(JSON.stringify({
                              type: 'PEER_DISCONNECTED',
                              reason: 'قام المستضيف بإغلاق الغرفة.',
                            }));
                          } catch (e) {}
                        }
                      }
                      rooms.delete(currentRoomCode);
                      broadcastActiveRooms();
                    }
                  }, 25000);
                } else {
                  // Client left a slot
                  const slotIdx = room.slots.findIndex((s) => s.ws === ws);
                  if (slotIdx !== -1) {
                    const leaverName = room.slots[slotIdx].name;
                    room.slots[slotIdx] = {
                      ...room.slots[slotIdx],
                      isOccupied: false,
                      isBot: false,
                      name: 'شاغر (انضمام أو بوت)',
                      ws: null,
                    };
                    const cleanSlots = room.slots.map((s) => ({
                      slotIndex: s.slotIndex,
                      team: s.team,
                      isOccupied: s.isOccupied,
                      isHost: s.isHost,
                      isBot: s.isBot,
                      name: s.name,
                      botDifficulty: s.botDifficulty,
                    }));
                    const payload = JSON.stringify({
                      type: 'TAG_ROOM_SLOTS_UPDATED',
                      roomCode: currentRoomCode,
                      slots: cleanSlots,
                      settings: room.settings,
                      leaverName,
                    });
                    for (const s of room.slots) {
                      if (s.ws && s.ws.readyState === WebSocket.OPEN) {
                        try {
                          s.ws.send(payload);
                        } catch (e) {}
                      }
                    }
                  }
                }
              } else {
                const target = isHost ? room.clientWs : room.hostWs;
                if (target && target.readyState === WebSocket.OPEN) {
                  try {
                    target.send(JSON.stringify({
                      type: 'PEER_DISCONNECTED',
                      reason: isHost ? 'غادر المستضيف الغرفة' : 'غادر المنافس الغرفة',
                    }));
                  } catch (e) {}
                }
                if (isHost) {
                  room.hostWs = null;
                  if (room.cleanupTimeout) clearTimeout(room.cleanupTimeout);
                  room.cleanupTimeout = setTimeout(() => {
                    const r = rooms.get(currentRoomCode);
                    if (r && !r.hostWs) {
                      rooms.delete(currentRoomCode);
                      broadcastActiveRooms();
                    }
                  }, 25000);
                } else {
                  room.clientWs = null;
                  room.clientName = null;
                }
              }
              broadcastActiveRooms();
            }
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), yugiohMultiplayerPlugin()],
  server: {
    port: 3000,
    host: true,
  },
});
