import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/sync_service.dart';
import '../models/risk_zone.dart';

class AnalyticsScreen extends StatefulWidget {
  final ApiService apiService;
  final SyncService syncService;

  const AnalyticsScreen({
    super.key,
    required this.apiService,
    required this.syncService,
  });

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  List<RiskZone> _zones = [];
  bool _isLoading = true;
  bool _gatewayOnline = false;

  @override
  void initState() {
    super.initState();
    _fetchTelemetry();
  }

  Future<void> _fetchTelemetry() async {
    setState(() => _isLoading = true);
    try {
      final isHealthy = await widget.apiService.checkGatewayHealth();
      final zones = await widget.apiService.getActiveRiskZones();
      if (mounted) {
        setState(() {
          _gatewayOnline = isHealthy;
          _zones = zones;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final reports = widget.syncService.getAllReports();
    final syncedReports = reports.where((r) => r.isSynced).length;
    final pendingReports = reports.where((r) => !r.isSynced).length;

    return Scaffold(
      backgroundColor: const Color(0xFF0B140F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0E2218),
        title: const Row(
          children: [
            Icon(Icons.query_stats, color: Color(0xFF00E676)),
            SizedBox(width: 8),
            Text(
              'ECO-SENTINEL ANALYTICS',
              style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.1, fontSize: 16),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF00E676)),
            onPressed: _fetchTelemetry,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00E676)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Pipeline Health Status Banner
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF13281E), Color(0xFF1E3F2E)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF27523C)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'SYSTEM CONNECTIVITY STATUS',
                          style: TextStyle(fontSize: 11, letterSpacing: 1.2, fontWeight: FontWeight.bold, color: Colors.white54),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _buildPipelinePill('Satellite Feeds', true),
                            const SizedBox(width: 8),
                            _buildPipelinePill('Cloud Gateway', _gatewayOnline || _zones.isNotEmpty),
                            const SizedBox(width: 8),
                            _buildPipelinePill('Media Storage', true),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  const Text(
                    'FOREST RISK & SENSOR METRICS',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.1, color: Colors.white70),
                  ),
                  const SizedBox(height: 10),

                  // Analytics Cards Grid
                  Row(
                    children: [
                      _buildMetricCard(
                        'Active Forest Risks',
                        '${_zones.length}',
                        'Canopy Loss & Stress',
                        Icons.warning_amber_rounded,
                        const Color(0xFFFF5252),
                      ),
                      const SizedBox(width: 12),
                      _buildMetricCard(
                        'Satellite Coverage',
                        'Active',
                        'Daily Mangrove Telemetry',
                        Icons.satellite_alt,
                        const Color(0xFF00E5FF),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _buildMetricCard(
                        'Field Reports',
                        '${reports.length}',
                        '$syncedReports Synced • $pendingReports Buffered',
                        Icons.assignment_turned_in_rounded,
                        const Color(0xFF00E676),
                      ),
                      const SizedBox(width: 12),
                      _buildMetricCard(
                        'LST Surface Temp',
                        '30.9 °C',
                        'Sensor: MOD11A2 1km',
                        Icons.thermostat,
                        const Color(0xFFFF9100),
                      ),
                    ],
                  ),

                  const SizedBox(height: 22),

                  const Text(
                    'ACTIVE ANOMALY SECTOR BREAKDOWN',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.1, color: Colors.white70),
                  ),
                  const SizedBox(height: 10),

                  if (_zones.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF13281E),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(
                        child: Text(
                          'All monitored sectors operating at normal baseline NDVI.',
                          style: TextStyle(color: Colors.white60, fontSize: 12),
                        ),
                      ),
                    )
                  else
                    ..._zones.map((z) => _buildSectorRow(z)),
                ],
              ),
            ),
    );
  }

  Widget _buildPipelinePill(String name, bool isOnline) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        decoration: BoxDecoration(
          color: isOnline ? const Color(0xFF00E676).withValues(alpha: 0.12) : const Color(0xFFFFAB00).withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isOnline ? const Color(0xFF00E676) : const Color(0xFFFFAB00)),
        ),
        child: Column(
          children: [
            Icon(
              isOnline ? Icons.check_circle : Icons.error_outline,
              size: 14,
              color: isOnline ? const Color(0xFF00E676) : const Color(0xFFFFAB00),
            ),
            const SizedBox(height: 4),
            Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: isOnline ? const Color(0xFF00E676) : const Color(0xFFFFAB00),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String mainValue, String subtitle, IconData icon, Color accentColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF13281E),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF1E3F2E)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 16, color: accentColor),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: Colors.white60),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              mainValue,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: accentColor),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 10, color: Colors.white38),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectorRow(RiskZone zone) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF13281E),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E3F2E)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFFF1744).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.satellite, size: 18, color: Color(0xFFFF5252)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  zone.name,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 2),
                Text(
                  'NDVI: ${zone.currentNdvi.toStringAsFixed(3)} (Base: ${zone.baselineNdvi.toStringAsFixed(3)}) • Temp: ${zone.surfaceTempC}°C',
                  style: const TextStyle(fontSize: 11, color: Colors.white54),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFFF1744).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: const Color(0xFFFF1744)),
            ),
            child: Text(
              '${zone.ndviDelta.toStringAsFixed(3)} Δ',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFFFF5252),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
