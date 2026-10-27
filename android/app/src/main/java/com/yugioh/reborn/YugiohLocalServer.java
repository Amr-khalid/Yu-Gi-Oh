package com.yugioh.reborn;

import android.util.Log;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;
import org.json.JSONArray;
import org.json.JSONObject;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class YugiohLocalServer extends WebSocketServer {
    private static final String TAG = "YugiohLocalServer";

    public static class Slot {
        public int slotIndex;
        public int team;
        public boolean isOccupied;
        public boolean isHost;
        public boolean isBot;
        public String name;
        public String botDifficulty;
        public WebSocket ws;

        public Slot(int slotIndex, int team, boolean isOccupied, boolean isHost, boolean isBot, String name, String botDifficulty, WebSocket ws) {
            this.slotIndex = slotIndex;
            this.team = team;
            this.isOccupied = isOccupied;
            this.isHost = isHost;
            this.isBot = isBot;
            this.name = name;
            this.botDifficulty = botDifficulty;
            this.ws = ws;
        }

        public JSONObject toJsonObject() {
            JSONObject obj = new JSONObject();
            try {
                obj.put("slotIndex", slotIndex);
                obj.put("team", team);
                obj.put("isOccupied", isOccupied);
                obj.put("isHost", isHost);
                obj.put("isBot", isBot);
                obj.put("name", name);
                if (botDifficulty != null) {
                    obj.put("botDifficulty", botDifficulty);
                }
            } catch (Exception ignored) {}
            return obj;
        }
    }

    public static class Room {
        public WebSocket hostWs;
        public WebSocket clientWs; // 1v1 client
        public String hostName;
        public String clientName;
        public String roomCode;
        public String transport;
        public String gameMode = "1v1";
        public long createdAt;
        public JSONObject settings;
        public final List<Slot> slots = new CopyOnWriteArrayList<>();

        public List<WebSocket> getAllActiveSockets() {
            List<WebSocket> list = new ArrayList<>();
            if ("tag_2v2".equals(gameMode)) {
                for (Slot s : slots) {
                    if (s.ws != null && s.ws.isOpen() && !list.contains(s.ws)) {
                        list.add(s.ws);
                    }
                }
            } else {
                if (hostWs != null && hostWs.isOpen()) list.add(hostWs);
                if (clientWs != null && clientWs.isOpen()) list.add(clientWs);
            }
            return list;
        }

        public JSONArray getCleanSlotsArray() {
            JSONArray arr = new JSONArray();
            for (Slot s : slots) {
                arr.put(s.toJsonObject());
            }
            return arr;
        }

        public int getOccupiedCount() {
            if ("tag_2v2".equals(gameMode)) {
                int count = 0;
                for (Slot s : slots) {
                    if (s.isOccupied || s.isBot) count++;
                }
                return count;
            } else {
                return (clientWs != null) ? 2 : 1;
            }
        }
    }

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();
    private final Map<WebSocket, String> wsToRoom = new ConcurrentHashMap<>();
    private final Map<WebSocket, Boolean> wsIsHost = new ConcurrentHashMap<>();

    public YugiohLocalServer(int port) {
        super(new InetSocketAddress("0.0.0.0", port));
        setReuseAddr(true);
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        Log.i(TAG, "New WebSocket client connected: " + conn.getRemoteSocketAddress());
        sendActiveRooms(conn);
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        Log.i(TAG, "WebSocket closed: " + conn.getRemoteSocketAddress());
        String roomCode = wsToRoom.remove(conn);
        Boolean isHost = wsIsHost.remove(conn);

        if (roomCode != null) {
            Room room = rooms.get(roomCode);
            if (room != null) {
                if (isHost != null && isHost) {
                    try {
                        JSONObject disconnectMsg = new JSONObject();
                        disconnectMsg.put("type", "PEER_DISCONNECTED");
                        disconnectMsg.put("reason", "غادر المستضيف الغرفة.");
                        String dStr = disconnectMsg.toString();
                        for (WebSocket ws : room.getAllActiveSockets()) {
                            if (ws != conn && ws.isOpen()) {
                                try { ws.send(dStr); } catch (Exception ignored) {}
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error sending disconnect message", e);
                    }
                    rooms.remove(roomCode);
                } else {
                    if ("tag_2v2".equals(room.gameMode)) {
                        for (Slot s : room.slots) {
                            if (s.ws == conn) {
                                s.isOccupied = false;
                                s.isBot = false;
                                s.name = "شاغر (انضمام أو بوت)";
                                s.ws = null;
                                break;
                            }
                        }
                        try {
                            JSONObject updatePayload = new JSONObject();
                            updatePayload.put("type", "TAG_ROOM_SLOTS_UPDATED");
                            updatePayload.put("roomCode", roomCode);
                            updatePayload.put("slots", room.getCleanSlotsArray());
                            updatePayload.put("settings", room.settings);
                            String updateStr = updatePayload.toString();

                            for (WebSocket ws : room.getAllActiveSockets()) {
                                try { ws.send(updateStr); } catch (Exception ignored) {}
                            }
                        } catch (Exception ignored) {}
                    } else {
                        room.clientWs = null;
                        room.clientName = null;
                        if (room.hostWs != null && room.hostWs.isOpen()) {
                            try {
                                JSONObject disconnectMsg = new JSONObject();
                                disconnectMsg.put("type", "PEER_DISCONNECTED");
                                disconnectMsg.put("reason", "غادر المنافس الغرفة.");
                                room.hostWs.send(disconnectMsg.toString());
                            } catch (Exception ignored) {}
                        }
                    }
                }
                broadcastActiveRooms();
            }
        }
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        try {
            JSONObject msg = new JSONObject(message);
            String type = msg.optString("type", "");

            if ("PING".equals(type)) {
                JSONObject pong = new JSONObject();
                pong.put("type", "PONG");
                pong.put("clientTime", msg.optLong("timestamp", 0));
                pong.put("serverTime", System.currentTimeMillis());
                conn.send(pong.toString());
                return;
            }

            if ("CREATE_ROOM".equals(type)) {
                String code = msg.optString("roomCode", "").trim();
                String hostName = msg.optString("hostName", "المستضيف");
                String transport = msg.optString("transport", "wifi");
                String gameMode = msg.optString("gameMode", "1v1");
                JSONObject settings = msg.optJSONObject("settings");
                if (settings == null) {
                    settings = new JSONObject();
                    settings.put("sharedGraveyard", true);
                    settings.put("lp", 16000);
                    settings.put("timerSec", 60);
                }

                Room old = rooms.get(code);
                if (old != null && old.hostWs != null && old.hostWs != conn && old.hostWs.isOpen()) {
                    try {
                        JSONObject replaced = new JSONObject();
                        replaced.put("type", "ROOM_REPLACED");
                        old.hostWs.send(replaced.toString());
                    } catch (Exception ignored) {}
                }

                Room room = new Room();
                room.hostWs = conn;
                room.hostName = hostName;
                room.roomCode = code;
                room.transport = transport;
                room.gameMode = gameMode;
                room.createdAt = System.currentTimeMillis();
                room.settings = settings;

                if ("tag_2v2".equals(gameMode)) {
                    room.slots.add(new Slot(0, 0, true, true, false, hostName, null, conn));
                    room.slots.add(new Slot(1, 0, false, false, false, "شاغر (انضمام أو بوت)", null, null));
                    room.slots.add(new Slot(2, 1, false, false, false, "شاغر (انضمام أو بوت)", null, null));
                    room.slots.add(new Slot(3, 1, false, false, false, "شاغر (انضمام أو بوت)", null, null));
                }

                rooms.put(code, room);
                wsToRoom.put(conn, code);
                wsIsHost.put(conn, true);

                JSONObject res = new JSONObject();
                res.put("type", "ROOM_CREATED");
                res.put("roomCode", code);
                res.put("hostName", hostName);
                res.put("transport", transport);
                res.put("gameMode", gameMode);
                res.put("settings", settings);
                if ("tag_2v2".equals(gameMode)) {
                    res.put("slots", room.getCleanSlotsArray());
                }
                conn.send(res.toString());

                broadcastActiveRooms();
                return;
            }

            if ("JOIN_ROOM".equals(type)) {
                String code = msg.optString("roomCode", "").trim();
                String clientName = msg.optString("clientName", "المنافس");

                Room room = rooms.get(code);
                if (room == null || room.hostWs == null || !room.hostWs.isOpen()) {
                    JSONObject err = new JSONObject();
                    err.put("type", "ROOM_ERROR");
                    err.put("message", "رمز الغرفة غير صحيح أو أن المستضيف غير متصل حالياً.");
                    conn.send(err.toString());
                    return;
                }

                if ("tag_2v2".equals(room.gameMode)) {
                    int targetSlotIndex = -1;
                    int requestedSlot = msg.optInt("targetSlotIndex", -1);
                    if (requestedSlot >= 1 && requestedSlot < room.slots.size()) {
                        Slot s = room.slots.get(requestedSlot);
                        if (!s.isOccupied && !s.isBot) {
                            targetSlotIndex = requestedSlot;
                        }
                    }
                    if (targetSlotIndex == -1) {
                        for (int i = 1; i < room.slots.size(); i++) {
                            Slot s = room.slots.get(i);
                            if (!s.isOccupied && !s.isBot) {
                                targetSlotIndex = i;
                                break;
                            }
                        }
                    }

                    if (targetSlotIndex == -1) {
                        JSONObject err = new JSONObject();
                        err.put("type", "ROOM_ERROR");
                        err.put("message", "هذه الغرفة ممتلئة بالفعل بأربعة مبارزين وبوتات.");
                        conn.send(err.toString());
                        return;
                    }

                    Slot slot = room.slots.get(targetSlotIndex);
                    slot.isOccupied = true;
                    slot.isHost = false;
                    slot.isBot = false;
                    slot.name = clientName;
                    slot.ws = conn;

                    wsToRoom.put(conn, code);
                    wsIsHost.put(conn, false);

                    int assignedTeam = (targetSlotIndex < 2) ? 0 : 1;

                    JSONObject joinRes = new JSONObject();
                    joinRes.put("type", "ROOM_CONNECTED");
                    joinRes.put("roomCode", code);
                    joinRes.put("gameMode", "tag_2v2");
                    joinRes.put("mySlot", targetSlotIndex);
                    joinRes.put("myTeam", assignedTeam);
                    joinRes.put("hostName", room.hostName);
                    joinRes.put("clientName", clientName);
                    joinRes.put("transport", room.transport != null ? room.transport : "wifi");
                    joinRes.put("settings", room.settings);
                    joinRes.put("slots", room.getCleanSlotsArray());
                    joinRes.put("connectedAt", System.currentTimeMillis());
                    conn.send(joinRes.toString());

                    JSONObject updatePayload = new JSONObject();
                    updatePayload.put("type", "TAG_ROOM_SLOTS_UPDATED");
                    updatePayload.put("roomCode", code);
                    updatePayload.put("slots", room.getCleanSlotsArray());
                    updatePayload.put("settings", room.settings);
                    String updateStr = updatePayload.toString();

                    for (WebSocket ws : room.getAllActiveSockets()) {
                        try { ws.send(updateStr); } catch (Exception ignored) {}
                    }

                    broadcastActiveRooms();
                    return;
                } else {
                    if (room.clientWs != null && room.clientWs != conn && room.clientWs.isOpen()) {
                        JSONObject err = new JSONObject();
                        err.put("type", "ROOM_ERROR");
                        err.put("message", "هذه الغرفة ممتلئة بالفعل بمبارز آخر.");
                        conn.send(err.toString());
                        return;
                    }

                    room.clientWs = conn;
                    room.clientName = clientName;
                    wsToRoom.put(conn, code);
                    wsIsHost.put(conn, false);

                    JSONObject matchPayload = new JSONObject();
                    matchPayload.put("type", "ROOM_CONNECTED");
                    matchPayload.put("roomCode", code);
                    matchPayload.put("gameMode", "1v1");
                    matchPayload.put("hostName", room.hostName);
                    matchPayload.put("clientName", clientName);
                    matchPayload.put("transport", room.transport != null ? room.transport : "wifi");
                    matchPayload.put("connectedAt", System.currentTimeMillis());

                    String payloadStr = matchPayload.toString();
                    if (room.hostWs != null && room.hostWs.isOpen()) {
                        room.hostWs.send(payloadStr);
                    }
                    conn.send(payloadStr);

                    broadcastActiveRooms();
                    return;
                }
            }

            if ("TAG_UPDATE_SLOT".equals(type)) {
                String code = wsToRoom.get(conn);
                Room room = (code != null) ? rooms.get(code) : null;
                Boolean isHost = wsIsHost.get(conn);
                if (room != null && "tag_2v2".equals(room.gameMode) && isHost != null && isHost) {
                    int slotIndex = msg.optInt("slotIndex", -1);
                    boolean isBot = msg.optBoolean("isBot", false);
                    String botDifficulty = msg.optString("botDifficulty", "normal");
                    String botName = msg.optString("botName", "");

                    if (slotIndex >= 1 && slotIndex <= 3 && slotIndex < room.slots.size()) {
                        Slot s = room.slots.get(slotIndex);
                        if (s.ws != null && s.ws != conn && s.ws.isOpen()) {
                            try {
                                JSONObject disc = new JSONObject();
                                disc.put("type", "PEER_DISCONNECTED");
                                disc.put("reason", "قام المستضيف بتغيير هذه الخانة إلى بوت أو تفريغها.");
                                s.ws.send(disc.toString());
                            } catch (Exception ignored) {}
                        }

                        s.isOccupied = isBot;
                        s.isBot = isBot;
                        s.botDifficulty = isBot ? botDifficulty : null;
                        if (isBot) {
                            s.name = !botName.isEmpty() ? botName : ("بوت " + ("hard".equals(botDifficulty) ? "أسطوري" : "ذكي") + " (" + (slotIndex < 2 ? "زميل" : "خصم") + ")");
                        } else {
                            s.name = "شاغر (انضمام أو بوت)";
                        }
                        s.ws = null;

                        JSONObject updatePayload = new JSONObject();
                        updatePayload.put("type", "TAG_ROOM_SLOTS_UPDATED");
                        updatePayload.put("roomCode", code);
                        updatePayload.put("slots", room.getCleanSlotsArray());
                        updatePayload.put("settings", room.settings);
                        String updateStr = updatePayload.toString();

                        for (WebSocket ws : room.getAllActiveSockets()) {
                            try { ws.send(updateStr); } catch (Exception ignored) {}
                        }
                        broadcastActiveRooms();
                    }
                }
                return;
            }

            if ("TAG_SWAP_SLOTS".equals(type)) {
                String code = wsToRoom.get(conn);
                Room room = (code != null) ? rooms.get(code) : null;
                if (room != null && "tag_2v2".equals(room.gameMode)) {
                    int fromSlot = msg.optInt("fromSlot", -1);
                    int toSlot = msg.optInt("toSlot", -1);
                    if (fromSlot >= 0 && fromSlot <= 3 && toSlot >= 0 && toSlot <= 3 && fromSlot != toSlot) {
                        Slot sFrom = room.slots.get(fromSlot);
                        Slot sTo = room.slots.get(toSlot);

                        room.slots.set(fromSlot, sTo);
                        room.slots.set(toSlot, sFrom);

                        sTo.slotIndex = fromSlot;
                        sTo.team = (fromSlot < 2) ? 0 : 1;
                        sFrom.slotIndex = toSlot;
                        sFrom.team = (toSlot < 2) ? 0 : 1;

                        for (Slot s : room.slots) {
                            s.isHost = (s.ws != null && s.ws == room.hostWs);
                        }

                        for (Slot s : room.slots) {
                            if (s.ws != null && s.ws.isOpen()) {
                                try {
                                    JSONObject myUpdate = new JSONObject();
                                    myUpdate.put("type", "TAG_MY_SLOT_UPDATED");
                                    myUpdate.put("mySlot", s.slotIndex);
                                    myUpdate.put("myTeam", s.team);
                                    s.ws.send(myUpdate.toString());
                                } catch (Exception ignored) {}
                            }
                        }

                        JSONObject updatePayload = new JSONObject();
                        updatePayload.put("type", "TAG_ROOM_SLOTS_UPDATED");
                        updatePayload.put("roomCode", code);
                        updatePayload.put("slots", room.getCleanSlotsArray());
                        updatePayload.put("settings", room.settings);
                        String updateStr = updatePayload.toString();

                        for (WebSocket ws : room.getAllActiveSockets()) {
                            try { ws.send(updateStr); } catch (Exception ignored) {}
                        }
                        broadcastActiveRooms();
                    }
                }
                return;
            }

            if ("TAG_UPDATE_SETTINGS".equals(type)) {
                String code = wsToRoom.get(conn);
                Room room = (code != null) ? rooms.get(code) : null;
                Boolean isHost = wsIsHost.get(conn);
                if (room != null && isHost != null && isHost) {
                    JSONObject newSettings = msg.optJSONObject("settings");
                    if (newSettings != null) {
                        room.settings = newSettings;
                        JSONObject setUpdate = new JSONObject();
                        setUpdate.put("type", "TAG_ROOM_SETTINGS_UPDATED");
                        setUpdate.put("settings", room.settings);
                        String setStr = setUpdate.toString();
                        for (WebSocket ws : room.getAllActiveSockets()) {
                            try { ws.send(setStr); } catch (Exception ignored) {}
                        }
                    }
                }
                return;
            }

            if ("CLOSE_ROOM".equals(type)) {
                String code = msg.optString("roomCode", wsToRoom.get(conn));
                if (code != null) {
                    Room room = rooms.remove(code);
                    if (room != null) {
                        JSONObject disc = new JSONObject();
                        disc.put("type", "PEER_DISCONNECTED");
                        disc.put("reason", "قام المستضيف بإغلاق الغرفة.");
                        String discStr = disc.toString();
                        for (WebSocket ws : room.getAllActiveSockets()) {
                            if (ws != conn && ws.isOpen()) {
                                try { ws.send(discStr); } catch (Exception ignored) {}
                            }
                        }
                        broadcastActiveRooms();
                    }
                }
                return;
            }

            if ("START_DUEL".equals(type) || "DUEL_COUNTDOWN_START".equals(type)) {
                String code = wsToRoom.get(conn);
                if (code != null) {
                    Room room = rooms.get(code);
                    if (room != null) {
                        String payload = msg.toString();
                        for (WebSocket ws : room.getAllActiveSockets()) {
                            if (ws.isOpen()) {
                                try { ws.send(payload); } catch (Exception ignored) {}
                            }
                        }
                    }
                }
                return;
            }

            if ("DUEL_ACTION".equals(type) ||
                "TAG_SYNC_FIELD".equals(type) ||
                "TAG_SYNC_HAND".equals(type) ||
                "TEAM_PING".equals(type) ||
                "SURRENDER".equals(type) ||
                "HANDSHAKE_ACK".equals(type) ||
                type.startsWith("JANKEN_")) {
                String code = wsToRoom.get(conn);
                if (code != null) {
                    Room room = rooms.get(code);
                    if (room != null) {
                        String payload = msg.toString();
                        for (WebSocket ws : room.getAllActiveSockets()) {
                            if (ws != conn && ws.isOpen()) {
                                try { ws.send(payload); } catch (Exception ignored) {}
                            }
                        }
                    }
                }
                return;
            }

            if ("GET_ACTIVE_ROOMS".equals(type)) {
                sendActiveRooms(conn);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling message", e);
        }
    }

    private void sendActiveRooms(WebSocket conn) {
        try {
            JSONArray active = new JSONArray();
            long now = System.currentTimeMillis();
            for (Map.Entry<String, Room> entry : rooms.entrySet()) {
                Room r = entry.getValue();
                if (r.hostWs != null && r.hostWs.isOpen() && (now - r.createdAt < 600000)) {
                    if ("tag_2v2".equals(r.gameMode)) {
                        int occupied = r.getOccupiedCount();
                        if (occupied < 4) {
                            JSONObject item = new JSONObject();
                            item.put("roomCode", entry.getKey());
                            item.put("hostName", r.hostName);
                            item.put("gameMode", "tag_2v2");
                            item.put("slotsOccupied", occupied);
                            item.put("maxSlots", 4);
                            item.put("transport", r.transport != null ? r.transport : "wifi");
                            item.put("settings", r.settings);
                            item.put("createdAt", r.createdAt);
                            active.put(item);
                        }
                    } else if (r.clientWs == null) {
                        JSONObject item = new JSONObject();
                        item.put("roomCode", entry.getKey());
                        item.put("hostName", r.hostName);
                        item.put("gameMode", "1v1");
                        item.put("slotsOccupied", 1);
                        item.put("maxSlots", 2);
                        item.put("transport", r.transport != null ? r.transport : "wifi");
                        item.put("createdAt", r.createdAt);
                        active.put(item);
                    }
                }
            }
            JSONObject res = new JSONObject();
            res.put("type", "ACTIVE_ROOMS_LIST");
            res.put("rooms", active);
            conn.send(res.toString());
        } catch (Exception e) {
            Log.e(TAG, "Error sending active rooms", e);
        }
    }

    private void broadcastActiveRooms() {
        try {
            JSONArray active = new JSONArray();
            long now = System.currentTimeMillis();
            for (Map.Entry<String, Room> entry : rooms.entrySet()) {
                Room r = entry.getValue();
                if (r.hostWs != null && r.hostWs.isOpen() && (now - r.createdAt < 600000)) {
                    if ("tag_2v2".equals(r.gameMode)) {
                        int occupied = r.getOccupiedCount();
                        if (occupied < 4) {
                            JSONObject item = new JSONObject();
                            item.put("roomCode", entry.getKey());
                            item.put("hostName", r.hostName);
                            item.put("gameMode", "tag_2v2");
                            item.put("slotsOccupied", occupied);
                            item.put("maxSlots", 4);
                            item.put("transport", r.transport != null ? r.transport : "wifi");
                            item.put("settings", r.settings);
                            item.put("createdAt", r.createdAt);
                            active.put(item);
                        }
                    } else if (r.clientWs == null) {
                        JSONObject item = new JSONObject();
                        item.put("roomCode", entry.getKey());
                        item.put("hostName", r.hostName);
                        item.put("gameMode", "1v1");
                        item.put("slotsOccupied", 1);
                        item.put("maxSlots", 2);
                        item.put("transport", r.transport != null ? r.transport : "wifi");
                        item.put("createdAt", r.createdAt);
                        active.put(item);
                    }
                }
            }
            JSONObject res = new JSONObject();
            res.put("type", "ACTIVE_ROOMS_LIST");
            res.put("rooms", active);
            String payload = res.toString();
            broadcast(payload);
        } catch (Exception e) {
            Log.e(TAG, "Error broadcasting active rooms", e);
        }
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        Log.e(TAG, "WebSocket error: " + (conn != null ? conn.getRemoteSocketAddress() : "null"), ex);
    }

    @Override
    public void onStart() {
        Log.i(TAG, "YugiohLocalServer started successfully on port: " + getPort());
    }
}
