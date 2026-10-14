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

            // 1. Host creates a room with 4-digit code
            if (msg.type === 'CREATE_ROOM') {
              const code = String(msg.roomCode).trim();
              currentRoomCode = code;
              isHost = true;

              // Clean any existing room with same code
              const old = rooms.get(code);
              if (old && old.hostWs && old.hostWs !== ws && old.hostWs.readyState === WebSocket.OPEN) {
                try {
                  old.hostWs.send(JSON.stringify({ type: 'ROOM_REPLACED' }));
                } catch (e) {}
              }

              rooms.set(code, {
                hostWs: ws,
                clientWs: null,
                hostName: msg.hostName || 'المستضيف',
                clientName: null,
                roomCode: code,
                createdAt: Date.now(),
              });

              ws.send(JSON.stringify({
                type: 'ROOM_CREATED',
                roomCode: code,
                hostName: msg.hostName || 'المستضيف',
              }));

              // Instantly broadcast new room availability to all waiting devices
              broadcastActiveRooms();
            }

            // 2. Client joins with 4-digit code
            else if (msg.type === 'JOIN_ROOM') {
              const code = String(msg.roomCode).trim();
              const room = rooms.get(code);

              if (!room || !room.hostWs || room.hostWs.readyState !== WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'ROOM_ERROR',
                  message: 'رمز الغرفة غير صحيح أو أن المستضيف غير متصل حالياً.',
                }));
                return;
              }

              if (room.clientWs && room.clientWs !== ws && room.clientWs.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'ROOM_ERROR',
                  message: 'هذه الغرفة ممتلئة بالفعل بمبارز آخر.',
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
                hostName: room.hostName,
                clientName: room.clientName,
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

            // 2.5 Close Room manually by Host
            else if (msg.type === 'CLOSE_ROOM') {
              const code = String(msg.roomCode || currentRoomCode).trim();
              if (code && rooms.has(code)) {
                const room = rooms.get(code);
                if (room && room.clientWs && room.clientWs.readyState === WebSocket.OPEN) {
                  try {
                    room.clientWs.send(JSON.stringify({
                      type: 'PEER_DISCONNECTED',
                      reason: 'قام المستضيف بإغلاق الغرفة.',
                    }));
                  } catch (e) {}
                }
                rooms.delete(code);
                broadcastActiveRooms();
              }
            }

            // 3. Start duel broadcast
            else if (msg.type === 'START_DUEL') {
              const room = rooms.get(currentRoomCode);
              if (room) {
                const payload = JSON.stringify(msg);
                if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
                  room.hostWs.send(payload);
                }
                if (room.clientWs && room.clientWs.readyState === WebSocket.OPEN) {
                  room.clientWs.send(payload);
                }
              }
            }

            // 4. Duel Action, Janken, or Surrender forwarded to opponent
            else if (
              msg.type === 'DUEL_ACTION' ||
              msg.type === 'SURRENDER' ||
              msg.type === 'HANDSHAKE_ACK' ||
              msg.type === 'DUEL_COUNTDOWN_START' ||
              (typeof msg.type === 'string' && msg.type.startsWith('JANKEN_'))
            ) {
              const room = rooms.get(currentRoomCode);
              if (room) {
                const target = isHost ? room.clientWs : room.hostWs;
                if (target && target.readyState === WebSocket.OPEN) {
                  target.send(JSON.stringify(msg));
                }
              }
            }

            // 5. Query active rooms list
            else if (msg.type === 'GET_ACTIVE_ROOMS') {
              const active = [];
              const now = Date.now();
              for (const [code, r] of rooms.entries()) {
                if (r.hostWs && r.hostWs.readyState === WebSocket.OPEN && !r.clientWs && now - r.createdAt < 600000) {
                  active.push({
                    roomCode: code,
                    hostName: r.hostName,
                    createdAt: r.createdAt,
                  });
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
                rooms.delete(currentRoomCode);
              } else {
                room.clientWs = null;
                room.clientName = null;
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
