package com.yugioh.reborn;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.DhcpInfo;
import android.net.LinkProperties;
import android.net.Network;
import android.net.RouteInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.FileReader;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

@CapacitorPlugin(name = "LocalServer")
public class LocalServerPlugin extends Plugin {
    private static final String TAG = "LocalServerPlugin";
    private static final int DEFAULT_PORT = 9001;

    private static YugiohLocalServer server = null;

    @PluginMethod
    public void startServer(PluginCall call) {
        int port = call.getInt("port", DEFAULT_PORT);

        try {
            if (server != null) {
                try {
                    server.stop(1000);
                } catch (Exception ignored) {}
                server = null;
            }

            String ip = getBestLocalIp();
            server = new YugiohLocalServer(port, ip);
            server.start();

            JSObject ret = new JSObject();
            ret.put("running", true);
            ret.put("port", port);
            ret.put("ip", ip);
            ret.put("isHotspot", "192.168.43.1".equals(ip) || ip.endsWith(".1"));

            JSArray arr = new JSArray();
            for (String s : getAllLocalIps()) {
                arr.put(s);
            }
            ret.put("allIps", arr);

            call.resolve(ret);
            Log.i(TAG, "Local WebSocket Server started on " + ip + ":" + port);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start local server", e);
            call.reject("Failed to start local server: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopServer(PluginCall call) {
        try {
            YugiohDiscovery.stopAnnouncing();
            YugiohDiscovery.stopListening();
            if (server != null) {
                server.stop(1000);
                server = null;
            }
            JSObject ret = new JSObject();
            ret.put("running", false);
            call.resolve(ret);
            Log.i(TAG, "Local WebSocket Server stopped");
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop local server", e);
            call.reject("Failed to stop local server: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getGatewayIp(PluginCall call) {
        String gateway = detectGatewayIp(getContext());
        JSObject ret = new JSObject();
        ret.put("gatewayIp", gateway);
        call.resolve(ret);
    }

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        try {
            YugiohDiscovery.startListening(getContext(), room -> {
                try {
                    JSObject obj = new JSObject();
                    obj.put("roomCode", room.optString("roomCode"));
                    obj.put("hostName", room.optString("hostName"));
                    obj.put("ip", room.optString("ip"));
                    obj.put("port", room.optInt("port", 9001));
                    obj.put("gameMode", room.optString("gameMode", "1v1"));
                    obj.put("timestamp", room.optLong("timestamp", System.currentTimeMillis()));
                    notifyListeners("onRoomDiscovered", obj);
                } catch (Exception ignored) {}
            });
            JSObject ret = new JSObject();
            ret.put("listening", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Error starting UDP discovery", e);
            call.reject("Error starting UDP discovery: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        try {
            YugiohDiscovery.stopListening();
            JSObject ret = new JSObject();
            ret.put("listening", false);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error stopping UDP discovery: " + e.getMessage());
        }
    }

    @PluginMethod
    public void startAnnouncing(PluginCall call) {
        String roomCode = call.getString("roomCode", "");
        String hostName = call.getString("hostName", "المستضيف");
        String ip = call.getString("ip", getBestLocalIp());
        int port = call.getInt("port", DEFAULT_PORT);
        String gameMode = call.getString("gameMode", "1v1");

        try {
            YugiohDiscovery.startAnnouncing(roomCode, hostName, ip, port, gameMode);
            JSObject ret = new JSObject();
            ret.put("announcing", true);
            ret.put("roomCode", roomCode);
            call.resolve(ret);
            Log.i(TAG, "Capacitor started UDP Room Announcing for room #" + roomCode);
        } catch (Exception e) {
            Log.e(TAG, "Error starting announce", e);
            call.reject("Error starting announce: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopAnnouncing(PluginCall call) {
        try {
            YugiohDiscovery.stopAnnouncing();
            JSObject ret = new JSObject();
            ret.put("announcing", false);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error stopping announce: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getServerStatus(PluginCall call) {
        boolean isRunning = (server != null);
        String ip = getBestLocalIp();
        JSObject ret = new JSObject();
        ret.put("running", isRunning);
        ret.put("port", isRunning ? server.getPort() : DEFAULT_PORT);
        ret.put("ip", ip);
        ret.put("isHotspot", "192.168.43.1".equals(ip) || ip.endsWith(".1"));

        JSArray arr = new JSArray();
        for (String s : getAllLocalIps()) {
            arr.put(s);
        }
        ret.put("allIps", arr);

        call.resolve(ret);
    }

    @PluginMethod
    public void getDeviceIp(PluginCall call) {
        String ip = getBestLocalIp();
        JSObject ret = new JSObject();
        ret.put("ip", ip);
        ret.put("isHotspot", "192.168.43.1".equals(ip) || ip.endsWith(".1"));

        JSArray arr = new JSArray();
        for (String s : getAllLocalIps()) {
            arr.put(s);
        }
        ret.put("allIps", arr);

        call.resolve(ret);
    }

    @PluginMethod
    public void checkHotspotStatus(PluginCall call) {
        Context context = getContext();
        String myIp = getBestLocalIp();
        String gwIp = detectGatewayIp(context);
        boolean isHotspotHost = "192.168.43.1".equals(myIp) || myIp.endsWith(".43.1");
        boolean isHotspotClient = "192.168.43.1".equals(gwIp) || (myIp.startsWith("192.168.43.") && !"192.168.43.1".equals(myIp));

        // Read ARP table to detect connected peer devices
        JSArray peers = new JSArray();
        int peerCount = 0;
        try {
            BufferedReader br = new BufferedReader(new FileReader("/proc/net/arp"));
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.trim().split("\\s+");
                if (parts.length >= 4) {
                    String ip = parts[0];
                    String flags = parts[2];
                    String mac = parts[3];
                    if ("0x2".equals(flags) && !"00:00:00:00:00:00".equals(mac)) {
                        if (ip.startsWith("192.168.43.") || ip.startsWith("192.168.")) {
                            peers.put(ip);
                            peerCount++;
                        }
                    }
                }
            }
            br.close();
        } catch (Exception ignored) {}

        JSObject ret = new JSObject();
        ret.put("myIp", myIp);
        ret.put("gatewayIp", gwIp != null ? gwIp : "");
        ret.put("isHotspotHost", isHotspotHost);
        ret.put("isHotspotClient", isHotspotClient);
        ret.put("isOnHotspot", isHotspotHost || isHotspotClient);
        ret.put("peerCount", peerCount);
        ret.put("peers", peers);
        call.resolve(ret);
    }

    public static String detectGatewayIp(Context context) {
        if (context == null) return null;

        // 1. ConnectivityManager RouteInfo (Standard Android API, zero permissions needed)
        try {
            ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Network activeNet = cm.getActiveNetwork();
                if (activeNet != null) {
                    LinkProperties lp = cm.getLinkProperties(activeNet);
                    if (lp != null) {
                        for (RouteInfo route : lp.getRoutes()) {
                            if (route.isDefaultRoute() && route.getGateway() != null) {
                                String gw = route.getGateway().getHostAddress();
                                if (gw != null && !gw.isEmpty() && !"0.0.0.0".equals(gw)) {
                                    Log.i(TAG, "Detected Gateway IP via ConnectivityManager: " + gw);
                                    return gw;
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error checking ConnectivityManager gateway", e);
        }

        // 2. /proc/net/route Linux kernel route table (Always readable without permissions)
        try {
            BufferedReader br = new BufferedReader(new FileReader("/proc/net/route"));
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.trim().split("\\s+");
                if (parts.length >= 3 && "00000000".equals(parts[1])) {
                    long gwHex = Long.parseLong(parts[2], 16);
                    if (gwHex != 0) {
                        String gw = (gwHex & 0xFF) + "." +
                                ((gwHex >> 8) & 0xFF) + "." +
                                ((gwHex >> 16) & 0xFF) + "." +
                                ((gwHex >> 24) & 0xFF);
                        br.close();
                        Log.i(TAG, "Detected Gateway IP via /proc/net/route: " + gw);
                        return gw;
                    }
                }
            }
            br.close();
        } catch (Exception ignored) {}

        // 3. WifiManager DhcpInfo fallback
        try {
            WifiManager wm = (WifiManager) context.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wm != null) {
                DhcpInfo dhcp = wm.getDhcpInfo();
                if (dhcp != null && dhcp.gateway != 0) {
                    int ipInt = dhcp.gateway;
                    String gw = (ipInt & 0xFF) + "." +
                            ((ipInt >> 8) & 0xFF) + "." +
                            ((ipInt >> 16) & 0xFF) + "." +
                            ((ipInt >> 24) & 0xFF);
                    Log.i(TAG, "Detected Gateway IP via DhcpInfo: " + gw);
                    return gw;
                }
            }
        } catch (Exception ignored) {}

        return null;
    }

    public static List<String> getAllLocalIps() {
        List<String> all = new ArrayList<>();
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface intf : interfaces) {
                if (intf.isLoopback()) continue;
                Enumeration<InetAddress> addrs = intf.getInetAddresses();
                while (addrs.hasMoreElements()) {
                    InetAddress addr = addrs.nextElement();
                    if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                        String sAddr = addr.getHostAddress();
                        if (sAddr != null && !sAddr.startsWith("127.") && !sAddr.startsWith("169.254.") && !all.contains(sAddr)) {
                            all.add(sAddr);
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
        return all;
    }

    public static String getBestLocalIp() {
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            List<String> apIps = new ArrayList<>();
            List<String> wifiIps = new ArrayList<>();
            List<String> otherIps = new ArrayList<>();

            for (NetworkInterface intf : interfaces) {
                if (intf.isLoopback()) continue;
                String name = intf.getName() != null ? intf.getName().toLowerCase() : "";

                Enumeration<InetAddress> addrs = intf.getInetAddresses();
                while (addrs.hasMoreElements()) {
                    InetAddress addr = addrs.nextElement();
                    if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                        String sAddr = addr.getHostAddress();
                        if (sAddr != null && !sAddr.startsWith("127.") && !sAddr.startsWith("169.254.")) {
                            if (name.contains("ap") || name.contains("softap") || name.contains("swlan") || name.contains("tether")) {
                                apIps.add(sAddr);
                            } else if (name.contains("wlan") || sAddr.startsWith("192.168.")) {
                                wifiIps.add(sAddr);
                            } else {
                                otherIps.add(sAddr);
                            }
                        }
                    }
                }
            }

            if (!apIps.isEmpty()) return apIps.get(0);
            if (!wifiIps.isEmpty()) return wifiIps.get(0);
            if (!otherIps.isEmpty()) return otherIps.get(0);
        } catch (Exception e) {
            Log.e(TAG, "Error discovering local IP", e);
        }
        return "192.168.43.1";
    }
}
