import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../models/starlink_node.dart';
import '../services/starlink_service.dart';
import '../services/sync_service.dart';

class StarlinkRouterSheet extends StatefulWidget {
  final StarlinkNode node;
  final LatLng userLocation;
  final SyncService syncService;

  const StarlinkRouterSheet({
    super.key,
    required this.node,
    required this.userLocation,
    required this.syncService,
  });

  static Future<void> show(
    BuildContext context, {
    required StarlinkNode node,
    required LatLng userLocation,
    required SyncService syncService,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => StarlinkRouterSheet(
        node: node,
        userLocation: userLocation,
        syncService: syncService,
      ),
    );
  }

  @override
  State<StarlinkRouterSheet> createState() => _StarlinkRouterSheetState();
}

class _StarlinkRouterSheetState extends State<StarlinkRouterSheet> {
  final StarlinkService _starlinkService = StarlinkService();

  @override
  Widget build(BuildContext context) {
    final distKm = _starlinkService.distanceKm(widget.userLocation, widget.node.location);

    return AnimatedBuilder(
      animation: Listenable.merge([
        _starlinkService.connectedNodeNotifier,
        _starlinkService.isConnectingNotifier,
        _starlinkService.connectionStepNotifier,
      ]),
      builder: (context, _) {
        final isConnected = _starlinkService.connectedNode?.id == widget.node.id;
        final isConnecting = _starlinkService.isConnectingNotifier.value;
        final stepText = _starlinkService.connectionStepNotifier.value;
        final assignedIp = _starlinkService.assignedIpNotifier.value;

        return Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0A1813),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(
              color: isConnected ? const Color(0xFF00E5FF) : const Color(0xFF1E3F30),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: (isConnected ? const Color(0xFF00E5FF) : const Color(0xFF00E676))
                    .withValues(alpha: 0.25),
                blurRadius: 25,
                spreadRadius: 2,
              ),
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Sheet Grab Handle
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Header Row: Starlink Dish Icon + Title + Status Pill
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: isConnected
                            ? [const Color(0xFF00E5FF), const Color(0xFF00557A)]
                            : [const Color(0xFF00E676), const Color(0xFF0B3A24)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: (isConnected ? const Color(0xFF00E5FF) : const Color(0xFF00E676))
                              .withValues(alpha: 0.4),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        '🛰️',
                        style: TextStyle(fontSize: isConnected ? 28 : 24),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: isConnected
                                    ? const Color(0xFF00E5FF).withValues(alpha: 0.2)
                                    : const Color(0xFF00E676).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: isConnected
                                      ? const Color(0xFF00E5FF)
                                      : const Color(0xFF00E676),
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                isConnected ? 'CONNECTED' : 'STARLINK LEO HOTSPOT',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.8,
                                  color: isConnected
                                      ? const Color(0xFF00E5FF)
                                      : const Color(0xFF00E676),
                                ),
                              ),
                            ),
                            const Spacer(),
                            Text(
                              '${distKm.toStringAsFixed(1)} km away',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.white54,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          widget.node.name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          widget.node.bengaliName,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF81C784),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // Cellular Dead Zone Warning Banner
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF26130D).withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFF9100).withValues(alpha: 0.6)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.signal_cellular_connected_no_internet_0_bar,
                        color: Color(0xFFFFAB00), size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.node.noInternetZoneTitle,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFFFE082),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            widget.node.deadZoneReason,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Colors.white70,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Telemetry Grid: Speed, Latency, Solar Battery, Clients
              Row(
                children: [
                  _buildStatTile(
                    label: 'DOWNLINK',
                    value: '${widget.node.downlinkMbps.toInt()} Mbps',
                    icon: Icons.download_rounded,
                    color: const Color(0xFF00E5FF),
                  ),
                  const SizedBox(width: 8),
                  _buildStatTile(
                    label: 'LEO LATENCY',
                    value: '${widget.node.latencyMs} ms',
                    icon: Icons.speed_rounded,
                    color: const Color(0xFF00E676),
                  ),
                  const SizedBox(width: 8),
                  _buildStatTile(
                    label: 'SOLAR BATTERY',
                    value: '${widget.node.batteryPercentage.toInt()}%',
                    icon: Icons.solar_power_rounded,
                    color: const Color(0xFFFFD600),
                  ),
                  const SizedBox(width: 8),
                  _buildStatTile(
                    label: 'CLIENTS',
                    value: '${widget.node.connectedClients + (isConnected ? 1 : 0)} Users',
                    icon: Icons.people_alt_rounded,
                    color: Colors.white70,
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // Wi-Fi Details Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF0D1E16),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white12),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.wifi_rounded, size: 16, color: Color(0xFF00E5FF)),
                        const SizedBox(width: 8),
                        const Text(
                          'FREE PUBLIC SSID:',
                          style: TextStyle(
                            fontSize: 10,
                            letterSpacing: 0.8,
                            fontWeight: FontWeight.bold,
                            color: Colors.white54,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            widget.node.routerSsid,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF00E5FF),
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (isConnected && assignedIp != null) ...[
                      const Divider(color: Colors.white12, height: 16),
                      Row(
                        children: [
                          const Icon(Icons.check_circle_rounded,
                              size: 14, color: Color(0xFF00E676)),
                          const SizedBox(width: 8),
                          Text(
                            'ASSIGNED IP: $assignedIp',
                            style: const TextStyle(
                              fontSize: 10,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF00E676),
                            ),
                          ),
                          const Spacer(),
                          const Text(
                            'UNLIMITED EMERGENCY BANDWIDTH',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: Colors.white38,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              // Step Animation when Connecting
              if (isConnecting) ...[
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF002738),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF00E5FF)),
                  ),
                  child: Column(
                    children: [
                      const LinearProgressIndicator(
                        color: Color(0xFF00E5FF),
                        backgroundColor: Colors.white10,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        stepText,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFFB2EBF2),
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 18),

              // Primary Action Buttons
              if (!isConnected)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: isConnecting
                        ? null
                        : () async {
                            await _starlinkService.connectToNode(
                              widget.node,
                              syncService: widget.syncService,
                            );
                            if (mounted) setState(() {});
                          },
                    icon: isConnecting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.black,
                            ),
                          )
                        : const Icon(Icons.wifi_tethering_rounded, color: Colors.black),
                    label: Text(
                      isConnecting
                          ? 'CONNECTING TO SATELLITE...'
                          : 'CONNECT TO STARLINK FREE ROUTER',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        letterSpacing: 0.6,
                        color: Colors.black,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00E676),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 6,
                    ),
                  ),
                )
              else
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          _starlinkService.disconnect(syncService: widget.syncService);
                          if (mounted) setState(() {});
                        },
                        icon: const Icon(Icons.link_off_rounded, color: Color(0xFFFF5252)),
                        label: const Text(
                          'DISCONNECT',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFFF5252),
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFFF5252)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          widget.syncService.syncPendingReports();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              backgroundColor: Color(0xFF003822),
                              content: Text(
                                '🛰️ Starlink Sync Triggered! Uploading offline incidents to Cloud...',
                                style: TextStyle(color: Color(0xFF00E676)),
                              ),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                        icon: const Icon(Icons.sync_rounded, color: Colors.black),
                        label: const Text(
                          'SYNC INCIDENTS NOW',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00E5FF),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatTile({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: const Color(0xFF10251C),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(height: 4),
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(fontSize: 8, color: Colors.white38),
            ),
          ],
        ),
      ),
    );
  }
}
