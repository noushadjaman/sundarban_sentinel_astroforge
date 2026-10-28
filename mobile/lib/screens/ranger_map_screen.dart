import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../models/risk_zone.dart';
import '../models/starlink_node.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import '../services/starlink_service.dart';
import '../services/sync_service.dart';
import '../widgets/offline_mode_dialog.dart';
import '../widgets/starlink_router_sheet.dart';
import '../widgets/incident_detail_sheet.dart';
import 'main_scaffold.dart';

class RangerMapScreen extends StatefulWidget {
  final ApiService apiService;
  final LocationService locationService;
  final SyncService syncService;

  const RangerMapScreen({
    super.key,
    required this.apiService,
    required this.locationService,
    required this.syncService,
  });

  @override
  State<RangerMapScreen> createState() => _RangerMapScreenState();
}

class _RangerMapScreenState extends State<RangerMapScreen> with SingleTickerProviderStateMixin {
  final MapController _mapController = MapController();
  final StarlinkService _starlinkService = StarlinkService();
  List<RiskZone> _riskZones = [];
  bool _isLoadingZones = true;
  bool _showStarlinkLayer = true;

  LatLng _rangerLocation = LocationService.defaultSundarbanLocation;
  StreamSubscription<LatLng>? _locationSub;

  bool _isSatelliteLayer = true;

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.85, end: 1.25).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    widget.syncService.reportsNotifier.addListener(_onReportsUpdated);
    _initLocation();
    _loadRiskZones();
  }

  void _onReportsUpdated() {
    if (mounted) setState(() {});
  }

  Future<void> _initLocation() async {
    final loc = await widget.locationService.getCurrentLocation();
    if (mounted) {
      setState(() => _rangerLocation = loc);
    }
    _locationSub = widget.locationService.locationStream.listen((newLoc) {
      if (mounted) {
        setState(() => _rangerLocation = newLoc);
      }
    });
  }

  Future<void> _loadRiskZones() async {
    if (!mounted) return;
    setState(() {
      _isLoadingZones = true;
    });

    try {
      final zones = await widget.apiService.getActiveRiskZones();
      if (mounted) {
        setState(() {
          _riskZones = zones;
          _isLoadingZones = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingZones = false;
        });
      }
    }
  }

  void _showZoneDetails(RiskZone zone) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF10221A),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF10221A),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border.all(color: const Color(0xFF1E3A2E)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
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
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          zone.name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          zone.description,
                          style: const TextStyle(fontSize: 12, color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: zone.isAnomaly
                          ? const Color(0xFFE53935).withValues(alpha: 0.25)
                          : const Color(0xFF00E676).withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: zone.isAnomaly ? const Color(0xFFFF5252) : const Color(0xFF00E676),
                      ),
                    ),
                    child: Text(
                      zone.status,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: zone.isAnomaly ? const Color(0xFFFF5252) : const Color(0xFF00E676),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(color: Colors.white12),
              const SizedBox(height: 12),

              // NASA Metrics Grid
              Row(
                children: [
                  _buildMetricCard(
                    title: 'Current NDVI',
                    value: zone.currentNdvi.toStringAsFixed(4),
                    icon: Icons.grass,
                    color: const Color(0xFF00E5FF),
                  ),
                  const SizedBox(width: 8),
                  _buildMetricCard(
                    title: 'Baseline NDVI',
                    value: zone.baselineNdvi.toStringAsFixed(4),
                    icon: Icons.history,
                    color: Colors.white70,
                  ),
                  const SizedBox(width: 8),
                  _buildMetricCard(
                    title: 'NDVI Delta',
                    value: '${zone.ndviDelta > 0 ? "+" : ""}${zone.ndviDelta.toStringAsFixed(4)}',
                    icon: Icons.trending_down,
                    color: zone.ndviDelta < -0.15 ? const Color(0xFFFF5252) : const Color(0xFFFFAB00),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildMetricCard(
                    title: 'Surface Temp',
                    value: '${zone.surfaceTempC.toStringAsFixed(1)} °C',
                    icon: Icons.thermostat,
                    color: const Color(0xFFFF9100),
                  ),
                  const SizedBox(width: 8),
                  _buildMetricCard(
                    title: 'Cloud Cover',
                    value: '${zone.cloudCover.toStringAsFixed(0)}%',
                    icon: Icons.cloud,
                    color: Colors.white60,
                  ),
                ],
              ),

              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.black26,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white10),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'NASA EARTHDATA SATELLITE METADATA',
                      style: TextStyle(fontSize: 10, letterSpacing: 1.1, color: Colors.white54, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Granule: ${zone.granuleId}',
                      style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: Colors.white70),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Sensor: ${zone.sensorProduct}',
                      style: const TextStyle(fontSize: 11, color: Colors.white60),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '16-Day Cycle: ${zone.acquisitionStart} to ${zone.acquisitionEnd}',
                      style: const TextStyle(fontSize: 11, color: Colors.white60),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _mapController.move(zone.center, 13.0);
                  },
                  icon: const Icon(Icons.my_location, color: Colors.black),
                  label: const Text(
                    'FOCUS MONITORING SECTOR',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00E676),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFF152A20),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 14, color: color),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 10, color: Colors.white54),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    widget.syncService.reportsNotifier.removeListener(_onReportsUpdated);
    _locationSub?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B1611),
      body: Stack(
        children: [
          // 1. FlutterMap Core
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _rangerLocation,
              initialZoom: 11.5,
              minZoom: 8.0,
              maxZoom: 18.0,
            ),
            children: [
              // Tile Layer (OpenStreetMap / Satellite fallback)
              TileLayer(
                urlTemplate: _isSatelliteLayer
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.sundarban.santinel',
                maxZoom: 18,
              ),
              // Risk Zone & Dead Zone Polygons Layer
              PolygonLayer(
                polygons: [
                  // NASA Risk Zones
                  ..._riskZones.map((zone) {
                    final isCrit = zone.ndviDelta < -0.18;
                    final fillColor = isCrit
                        ? const Color(0xFFFF1744).withValues(alpha: 0.35)
                        : const Color(0xFFFF9100).withValues(alpha: 0.30);
                    final borderColor = isCrit ? const Color(0xFFFF1744) : const Color(0xFFFF9100);

                    return Polygon(
                      points: zone.polygon,
                      color: fillColor,
                      borderColor: borderColor,
                      borderStrokeWidth: 2.5,
                    );
                  }),

                  // 8 Sundarban No-Internet Dead Zones (Cellular Blackouts)
                  if (_showStarlinkLayer)
                    ...StarlinkService.nodes.map((node) {
                      return Polygon(
                        points: node.deadZonePolygon,
                        color: const Color(0xFFFF5722).withValues(alpha: 0.20),
                        borderColor: const Color(0xFFFF3D00).withValues(alpha: 0.85),
                        borderStrokeWidth: 2.0,
                      );
                    }),
                ],
              ),

              // Markers Layer: NASA Centers + No-Internet Badges + Starlink Routers + Ranger
              MarkerLayer(
                markers: [
                  // NASA Zone Center Markers
                  ..._riskZones.map((zone) {
                    return Marker(
                      point: zone.center,
                      width: 90,
                      height: 40,
                      child: GestureDetector(
                        onTap: () => _showZoneDetails(zone),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F2018).withValues(alpha: 0.9),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: zone.isAnomaly ? const Color(0xFFFF5252) : const Color(0xFF00E676),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: (zone.isAnomaly ? Colors.red : Colors.green).withValues(alpha: 0.4),
                                blurRadius: 6,
                              )
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                zone.isAnomaly ? Icons.warning_amber_rounded : Icons.check_circle_outline,
                                size: 12,
                                color: zone.isAnomaly ? const Color(0xFFFF5252) : const Color(0xFF00E676),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${zone.ndviDelta > 0 ? "+" : ""}${zone.ndviDelta.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),

                  // Starlink Hotspot & Dead Zone Markers
                  if (_showStarlinkLayer) ...[
                    // A. No-Internet Zone Warning Badges
                    ...StarlinkService.nodes.map((node) {
                      final topPt = node.deadZonePolygon[1];
                      return Marker(
                        point: topPt,
                        width: 140,
                        height: 26,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E0A05).withValues(alpha: 0.92),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFFF5722), width: 1.0),
                            boxShadow: const [
                              BoxShadow(color: Colors.black54, blurRadius: 4),
                            ],
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.signal_cellular_connected_no_internet_0_bar,
                                  size: 11, color: Color(0xFFFFAB00)),
                              SizedBox(width: 4),
                              Text(
                                'NO INTERNET ZONE',
                                style: TextStyle(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5,
                                  color: Color(0xFFFFD54F),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),

                    // B. Starlink LEO Satellite Free Hotspot Station Markers
                    ...StarlinkService.nodes.map((node) {
                      return Marker(
                        point: node.location,
                        width: 135,
                        height: 52,
                        child: ValueListenableBuilder<StarlinkNode?>(
                          valueListenable: _starlinkService.connectedNodeNotifier,
                          builder: (context, connectedNode, _) {
                            final isConnected = connectedNode?.id == node.id;
                            return GestureDetector(
                              onTap: () {
                                StarlinkRouterSheet.show(
                                  context,
                                  node: node,
                                  userLocation: _rangerLocation,
                                  syncService: widget.syncService,
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF071711).withValues(alpha: 0.95),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: isConnected
                                        ? const Color(0xFF00E5FF)
                                        : const Color(0xFF00E676),
                                    width: isConnected ? 2.0 : 1.4,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: (isConnected
                                              ? const Color(0xFF00E5FF)
                                              : const Color(0xFF00E676))
                                          .withValues(alpha: isConnected ? 0.6 : 0.3),
                                      blurRadius: isConnected ? 12 : 6,
                                      spreadRadius: isConnected ? 1 : 0,
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 24,
                                      height: 24,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: isConnected
                                            ? const Color(0xFF00E5FF).withValues(alpha: 0.25)
                                            : const Color(0xFF00E676).withValues(alpha: 0.20),
                                      ),
                                      child: const Center(
                                        child: Text('🛰️', style: TextStyle(fontSize: 13)),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            isConnected ? 'CONNECTED' : 'STARLINK FREE',
                                            style: TextStyle(
                                              fontSize: 8,
                                              fontWeight: FontWeight.w900,
                                              letterSpacing: 0.5,
                                              color: isConnected
                                                  ? const Color(0xFF00E5FF)
                                                  : const Color(0xFF00E676),
                                            ),
                                          ),
                                          Text(
                                            node.name.split(' ').first,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      );
                    }),
                  ],

                  // Field Incidents Logged on the Ground (Reactive Real-time)
                  ...widget.syncService.reportsNotifier.value.map((rep) {
                    final isThreat = rep.label == 'current_jal' || rep.label.contains('jal');
                    return Marker(
                      point: LatLng(rep.lat, rep.lng),
                      width: 95,
                      height: 44,
                      child: GestureDetector(
                        onTap: () {
                          IncidentDetailSheet.show(
                            context,
                            report: rep,
                            syncService: widget.syncService,
                            onViewInVault: () => MainScaffold.switchToTab(context, 2),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF130905).withValues(alpha: 0.95),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isThreat ? const Color(0xFFFF1744) : const Color(0xFFFFAB00),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: (isThreat ? Colors.red : Colors.orange).withValues(alpha: 0.4),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(isThreat ? '🚨' : '📍', style: const TextStyle(fontSize: 12)),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      rep.label.split('_').first.toUpperCase(),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    Text(
                                      rep.isSynced ? 'SYNCED' : 'BUFFER',
                                      style: TextStyle(
                                        fontSize: 7.5,
                                        fontWeight: FontWeight.bold,
                                        color: rep.isSynced
                                            ? const Color(0xFF00E676)
                                            : const Color(0xFFFF9100),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),

                  // Field Ranger Current Location Marker
                  Marker(
                    point: _rangerLocation,
                    width: 70,
                    height: 70,
                    child: AnimatedBuilder(
                      animation: _pulseAnimation,
                      builder: (context, child) {
                        return Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: 48 * _pulseAnimation.value,
                              height: 48 * _pulseAnimation.value,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFF00E676).withValues(alpha: 0.25),
                              ),
                            ),
                            Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFF00E676),
                                border: Border.all(color: Colors.white, width: 2.5),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Colors.black54,
                                    blurRadius: 6,
                                  ),
                                ],
                              ),
                            ),
                            const Positioned(
                              bottom: 0,
                              child: Text(
                                'RANGER',
                                style: TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  backgroundColor: Colors.black54,
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),

          // 2. Top Telemetry Bar (GPS + Satellite Status)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  // Status Capsule
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0E1F17).withValues(alpha: 0.90),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF1E3A2E)),
                      boxShadow: const [
                        BoxShadow(color: Colors.black45, blurRadius: 8),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _riskZones.isNotEmpty ? const Color(0xFF00E676) : const Color(0xFFFFAB00),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${_riskZones.length} RISK ZONES • ${widget.syncService.reportsNotifier.value.length} REPORTS',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.6,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Offline Mode Highlight Badge
                  ValueListenableBuilder<bool>(
                    valueListenable: widget.syncService.isOnlineNotifier,
                    builder: (context, isOnline, child) {
                      if (isOnline) return const SizedBox.shrink();
                      return GestureDetector(
                        onTap: () => OfflineModeDialog.show(context),
                        child: Container(
                          margin: const EdgeInsets.only(left: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFF9100).withValues(alpha: 0.22),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFFF9100), width: 1.5),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFFF9100).withValues(alpha: 0.40),
                                blurRadius: 10,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.wifi_off_rounded,
                                color: Color(0xFFFFB74D),
                                size: 14,
                              ),
                              SizedBox(width: 5),
                              Text(
                                'OFFLINE',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.8,
                                  color: Color(0xFFFFB74D),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),

                  const Spacer(),

                  // Starlink Hotspots Layer Toggle Button
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF0E1F17).withValues(alpha: 0.90),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _showStarlinkLayer ? const Color(0xFF00E5FF) : const Color(0xFF1E3A2E),
                      ),
                    ),
                    child: IconButton(
                      icon: const Text('🛰️', style: TextStyle(fontSize: 16)),
                      tooltip: 'Toggle Starlink Hotspots Layer',
                      onPressed: () => setState(() => _showStarlinkLayer = !_showStarlinkLayer),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Layer Toggle Button
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF0E1F17).withValues(alpha: 0.90),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1E3A2E)),
                    ),
                    child: IconButton(
                      icon: Icon(
                        _isSatelliteLayer ? Icons.satellite_alt : Icons.map,
                        color: const Color(0xFF00E5FF),
                        size: 20,
                      ),
                      tooltip: 'Toggle Base Map',
                      onPressed: () => setState(() => _isSatelliteLayer = !_isSatelliteLayer),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Refresh Button
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF0E1F17).withValues(alpha: 0.90),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1E3A2E)),
                    ),
                    child: IconButton(
                      icon: _isLoadingZones
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF00E676)),
                            )
                          : const Icon(Icons.refresh, color: Color(0xFF00E676), size: 20),
                      tooltip: 'Sync NASA Risks',
                      onPressed: _isLoadingZones ? null : _loadRiskZones,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 2.1 Floating Offline Banner on Home Screen (shown only if not connected to Starlink)
          ValueListenableBuilder<StarlinkNode?>(
            valueListenable: _starlinkService.connectedNodeNotifier,
            builder: (context, starlinkNode, _) {
              if (starlinkNode != null) return const SizedBox.shrink();
              return ValueListenableBuilder<bool>(
                valueListenable: widget.syncService.isOnlineNotifier,
                builder: (context, isOnline, child) {
                  if (isOnline) return const SizedBox.shrink();
                  return Positioned(
                    top: 72,
                    left: 16,
                    right: 16,
                    child: GestureDetector(
                      onTap: () => OfflineModeDialog.show(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                        decoration: BoxDecoration(
                          color: const Color(0xFF171003).withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: const Color(0xFFFF9100).withValues(alpha: 0.75),
                            width: 1.2,
                          ),
                          boxShadow: const [
                            BoxShadow(color: Colors.black54, blurRadius: 12, offset: Offset(0, 3)),
                          ],
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.cloud_off_rounded, color: Color(0xFFFF9100), size: 16),
                            SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Offline Field Mode • Edge AI & Incident Buffer Active',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFFFE082),
                                ),
                              ),
                            ),
                            Icon(Icons.info_outline, color: Color(0xFFFFB74D), size: 15),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              );
            },
          ),

          // 2.2 Floating Starlink Connection Status Banner
          ValueListenableBuilder<StarlinkNode?>(
            valueListenable: _starlinkService.connectedNodeNotifier,
            builder: (context, connectedNode, child) {
              if (connectedNode == null) return const SizedBox.shrink();
              return Positioned(
                top: 72,
                left: 16,
                right: 16,
                child: GestureDetector(
                  onTap: () {
                    StarlinkRouterSheet.show(
                      context,
                      node: connectedNode,
                      userLocation: _rangerLocation,
                      syncService: widget.syncService,
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF001B24).withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF00E5FF), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF00E5FF).withValues(alpha: 0.35),
                          blurRadius: 14,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Text('🛰️', style: TextStyle(fontSize: 16)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'STARLINK FREE LEO: ${connectedNode.routerSsid}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                  color: Color(0xFF00E5FF),
                                ),
                              ),
                              Text(
                                '${connectedNode.downlinkMbps.toInt()} Mbps • Ping ${connectedNode.latencyMs}ms • Realtime Cloud Sync Active',
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: Color(0xFFB2EBF2),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00E5FF).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'MANAGE',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF00E5FF),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),

          // 3. Floating Quick Action: Connect to Nearest Starlink Router
          Positioned(
            right: 16,
            bottom: 82,
            child: FloatingActionButton.extended(
              heroTag: 'starlink_fab',
              backgroundColor: const Color(0xFF00E5FF),
              foregroundColor: Colors.black,
              onPressed: () {
                final nearest = _starlinkService.getNearestNode(_rangerLocation);
                _mapController.move(nearest.location, 13.0);
                StarlinkRouterSheet.show(
                  context,
                  node: nearest,
                  userLocation: _rangerLocation,
                  syncService: widget.syncService,
                );
              },
              icon: const Text('🛰️', style: TextStyle(fontSize: 16)),
              label: const Text(
                'FREE STARLINK ROUTER',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.6,
                ),
              ),
            ),
          ),

          // 4. Floating Action Center on Ranger
          Positioned(
            right: 16,
            bottom: 24,
            child: FloatingActionButton(
              heroTag: 'gps_fab',
              mini: true,
              backgroundColor: const Color(0xFF00E676),
              onPressed: () {
                _mapController.move(_rangerLocation, 13.0);
              },
              child: const Icon(Icons.gps_fixed, color: Colors.black),
            ),
          ),
        ],
      ),
    );
  }
}
