package com.yugioh.reborn;

import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

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

            server = new YugiohLocalServer(port);
            server.start();

            String ip = getBestLocalIp();
            JSObject ret = new JSObject();
            ret.put("running", true);
            ret.put("port", port);
            ret.put("ip", ip);
            ret.put("isHotspot", "192.168.43.1".equals(ip));
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
    public void getServerStatus(PluginCall call) {
        boolean isRunning = (server != null);
        String ip = getBestLocalIp();
        JSObject ret = new JSObject();
        ret.put("running", isRunning);
        ret.put("port", isRunning ? server.getPort() : DEFAULT_PORT);
        ret.put("ip", ip);
        ret.put("isHotspot", "192.168.43.1".equals(ip));
        call.resolve(ret);
    }

    @PluginMethod
    public void getDeviceIp(PluginCall call) {
        String ip = getBestLocalIp();
        JSObject ret = new JSObject();
        ret.put("ip", ip);
        ret.put("isHotspot", "192.168.43.1".equals(ip));
        call.resolve(ret);
    }

    private String getBestLocalIp() {
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            List<String> hotspotIps = new ArrayList<>();
            List<String> wifiIps = new ArrayList<>();
            List<String> otherIps = new ArrayList<>();

            for (NetworkInterface intf : interfaces) {
                if (intf.isLoopback() || !intf.isUp()) continue;

                Enumeration<InetAddress> addrs = intf.getInetAddresses();
                while (addrs.hasMoreElements()) {
                    InetAddress addr = addrs.nextElement();
                    if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                        String sAddr = addr.getHostAddress();
                        if (sAddr != null) {
                            if ("192.168.43.1".equals(sAddr)) {
                                hotspotIps.add(sAddr);
                            } else if (sAddr.startsWith("192.168.")) {
                                wifiIps.add(sAddr);
                            } else if (sAddr.startsWith("10.") || sAddr.startsWith("172.")) {
                                otherIps.add(sAddr);
                            }
                        }
                    }
                }
            }

            if (!hotspotIps.isEmpty()) return hotspotIps.get(0);
            if (!wifiIps.isEmpty()) return wifiIps.get(0);
            if (!otherIps.isEmpty()) return otherIps.get(0);
        } catch (Exception e) {
            Log.e(TAG, "Error discovering local IP", e);
        }
        return "127.0.0.1";
    }
}
