package com.yugioh.reborn;

import android.content.Context;
import android.net.DhcpInfo;
import android.net.wifi.WifiManager;
import android.util.Log;
import org.json.JSONObject;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

/**
 * YugiohDiscovery
 * Zero-configuration local network discovery over Wi-Fi and Hotspot.
 * Uses UDP broadcast & multicast probing on port 9002 so friends find each other
 * in under 100ms without having to type or know IP addresses.
 */
public class YugiohDiscovery {
    private static final String TAG = "YugiohDiscovery";
    public static final int DISCOVERY_PORT = 9002;

    public interface OnRoomDiscoveredListener {
        void onRoomDiscovered(JSONObject room);
    }

    private static Thread announceThread = null;
    private static DatagramSocket announceSocket = null;
    private static volatile boolean isAnnouncing = false;

    private static Thread listenThread = null;
    private static DatagramSocket listenSocket = null;
    private static volatile boolean isListening = false;
    private static WifiManager.MulticastLock multicastLock = null;

    /**
     * Start broadcasting room existence to any nearby phones.
     */
    public static synchronized void startAnnouncing(String roomCode, String hostName, String ip, int wsPort, String gameMode) {
        stopAnnouncing();

        isAnnouncing = true;
        announceThread = new Thread(() -> {
            try {
                announceSocket = new DatagramSocket(DISCOVERY_PORT);
                announceSocket.setBroadcast(true);
                announceSocket.setReuseAddress(true);
                announceSocket.setSoTimeout(1000);

                JSONObject announceJson = new JSONObject();
                announceJson.put("type", "YUGIOH_ANNOUNCE");
                announceJson.put("roomCode", roomCode);
                announceJson.put("hostName", hostName);
                announceJson.put("ip", ip);
                announceJson.put("port", wsPort);
                announceJson.put("gameMode", gameMode);
                announceJson.put("timestamp", System.currentTimeMillis());

                byte[] sendData = announceJson.toString().getBytes(StandardCharsets.UTF_8);
                List<InetAddress> broadcastAddresses = getBroadcastAddresses();

                byte[] receiveBuf = new byte[1024];
                long lastBroadcast = 0;

                while (isAnnouncing && !Thread.currentThread().isInterrupted()) {
                    long now = System.currentTimeMillis();

                    // Broadcast every 1000ms
                    if (now - lastBroadcast >= 1000) {
                        announceJson.put("timestamp", now);
                        byte[] freshData = announceJson.toString().getBytes(StandardCharsets.UTF_8);
                        for (InetAddress bAddr : broadcastAddresses) {
                            try {
                                DatagramPacket packet = new DatagramPacket(freshData, freshData.length, bAddr, DISCOVERY_PORT);
                                announceSocket.send(packet);
                            } catch (Exception ignored) {}
                        }
                        lastBroadcast = now;
                    }

                    // Check for probe requests from clients
                    try {
                        DatagramPacket incoming = new DatagramPacket(receiveBuf, receiveBuf.length);
                        announceSocket.receive(incoming);

                        String received = new String(incoming.getData(), 0, incoming.getLength(), StandardCharsets.UTF_8);
                        if (received.contains("YUGIOH_PROBE")) {
                            // Immediate reply to the probing client
                            DatagramPacket reply = new DatagramPacket(sendData, sendData.length, incoming.getAddress(), incoming.getPort());
                            announceSocket.send(reply);
                        }
                    } catch (java.net.SocketTimeoutException ignored) {
                        // Normal timeout to allow loop check
                    } catch (Exception ignored) {}
                }
            } catch (Exception e) {
                Log.w(TAG, "Announce thread ended: " + e.getMessage());
            } finally {
                if (announceSocket != null && !announceSocket.isClosed()) {
                    announceSocket.close();
                }
            }
        });
        announceThread.setDaemon(true);
        announceThread.start();
        Log.i(TAG, "Started UDP Room Announcing for room #" + roomCode);
    }

    public static synchronized void stopAnnouncing() {
        isAnnouncing = false;
        if (announceSocket != null && !announceSocket.isClosed()) {
            try {
                announceSocket.close();
            } catch (Exception ignored) {}
            announceSocket = null;
        }
        if (announceThread != null) {
            announceThread.interrupt();
            announceThread = null;
        }
    }

    /**
     * Start listening for nearby rooms and probe active hosts.
     */
    public static synchronized void startListening(Context context, OnRoomDiscoveredListener listener) {
        stopListening();

        acquireMulticastLock(context);
        isListening = true;

        listenThread = new Thread(() -> {
            try {
                listenSocket = new DatagramSocket(null);
                listenSocket.setReuseAddress(true);
                listenSocket.setBroadcast(true);
                try {
                    listenSocket.bind(new java.net.InetSocketAddress(DISCOVERY_PORT));
                } catch (Exception bindEx) {
                    listenSocket.bind(new java.net.InetSocketAddress(0));
                }
                listenSocket.setSoTimeout(800);

                // Send immediate broadcast probe
                JSONObject probeJson = new JSONObject();
                probeJson.put("type", "YUGIOH_PROBE");
                probeJson.put("timestamp", System.currentTimeMillis());
                byte[] probeData = probeJson.toString().getBytes(StandardCharsets.UTF_8);

                List<InetAddress> targets = getProbeTargets(context);
                for (InetAddress target : targets) {
                    try {
                        DatagramPacket probePacket = new DatagramPacket(probeData, probeData.length, target, DISCOVERY_PORT);
                        listenSocket.send(probePacket);
                    } catch (Exception ignored) {}
                }

                byte[] buffer = new byte[2048];
                long lastProbe = System.currentTimeMillis();

                while (isListening && !Thread.currentThread().isInterrupted()) {
                    long now = System.currentTimeMillis();
                    if (now - lastProbe >= 1200) {
                        for (InetAddress target : targets) {
                            try {
                                DatagramPacket probePacket = new DatagramPacket(probeData, probeData.length, target, DISCOVERY_PORT);
                                listenSocket.send(probePacket);
                            } catch (Exception ignored) {}
                        }
                        lastProbe = now;
                    }

                    try {
                        DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                        listenSocket.receive(packet);

                        String text = new String(packet.getData(), 0, packet.getLength(), StandardCharsets.UTF_8);
                        if (text.contains("YUGIOH_ANNOUNCE")) {
                            JSONObject obj = new JSONObject(text);
                            // If IP was 0.0.0.0 or empty, use the packet sender's IP address
                            String senderIp = packet.getAddress().getHostAddress();
                            if (!obj.has("ip") || "127.0.0.1".equals(obj.optString("ip")) || obj.optString("ip").isEmpty()) {
                                obj.put("ip", senderIp);
                            }
                            if (listener != null) {
                                listener.onRoomDiscovered(obj);
                            }
                        }
                    } catch (java.net.SocketTimeoutException ignored) {
                        // Normal timeout
                    } catch (Exception ignored) {}
                }
            } catch (Exception e) {
                Log.w(TAG, "Discovery listener ended: " + e.getMessage());
            } finally {
                if (listenSocket != null && !listenSocket.isClosed()) {
                    listenSocket.close();
                }
                releaseMulticastLock();
            }
        });
        listenThread.setDaemon(true);
        listenThread.start();
        Log.i(TAG, "Started UDP Room Discovery Listener on port " + DISCOVERY_PORT);
    }

    public static synchronized void stopListening() {
        isListening = false;
        if (listenSocket != null && !listenSocket.isClosed()) {
            try {
                listenSocket.close();
            } catch (Exception ignored) {}
            listenSocket = null;
        }
        if (listenThread != null) {
            listenThread.interrupt();
            listenThread = null;
        }
        releaseMulticastLock();
    }

    private static List<InetAddress> getProbeTargets(Context context) {
        List<InetAddress> list = new ArrayList<>(getBroadcastAddresses());
        // Add common unicast hotspot host targets to bypass AP multicast blocks
        String[] unicasts = new String[]{"192.168.43.1", "192.168.49.1", "192.168.50.1"};
        for (String u : unicasts) {
            try {
                InetAddress addr = InetAddress.getByName(u);
                if (!list.contains(addr)) list.add(addr);
            } catch (Exception ignored) {}
        }
        if (context != null) {
            String gw = LocalServerPlugin.detectGatewayIp(context);
            if (gw != null && !gw.isEmpty()) {
                try {
                    InetAddress gwAddr = InetAddress.getByName(gw);
                    if (!list.contains(gwAddr)) list.add(gwAddr);
                } catch (Exception ignored) {}
            }
        }
        return list;
    }

    private static List<InetAddress> getBroadcastAddresses() {
        List<InetAddress> list = new ArrayList<>();
        try {
            // General broadcast
            list.add(InetAddress.getByName("255.255.255.255"));
            // Common Android Hotspot subnets
            list.add(InetAddress.getByName("192.168.43.255"));
            list.add(InetAddress.getByName("192.168.49.255"));
            list.add(InetAddress.getByName("192.168.50.255"));

            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            if (interfaces != null) {
                for (NetworkInterface intf : Collections.list(interfaces)) {
                    if (intf.isLoopback()) continue;
                    for (InterfaceAddress ifAddr : intf.getInterfaceAddresses()) {
                        InetAddress broadcast = ifAddr.getBroadcast();
                        if (broadcast != null && !list.contains(broadcast)) {
                            list.add(broadcast);
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error calculating broadcast addresses", e);
        }
        return list;
    }

    private static void acquireMulticastLock(Context context) {
        if (context == null) return;
        try {
            WifiManager wm = (WifiManager) context.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wm != null && multicastLock == null) {
                multicastLock = wm.createMulticastLock("yugioh_discovery_lock");
                multicastLock.setReferenceCounted(true);
                multicastLock.acquire();
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to acquire MulticastLock: " + e.getMessage());
        }
    }

    private static void releaseMulticastLock() {
        if (multicastLock != null) {
            try {
                if (multicastLock.isHeld()) {
                    multicastLock.release();
                }
            } catch (Exception ignored) {}
            multicastLock = null;
        }
    }
}
