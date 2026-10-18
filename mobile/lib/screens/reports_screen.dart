import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/incident_report.dart';
import '../services/sync_service.dart';

class ReportsScreen extends StatefulWidget {
  final SyncService syncService;

  const ReportsScreen({
    super.key,
    required this.syncService,
  });

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  List<IncidentReport> _reports = [];

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  void _loadReports() {
    setState(() {
      _reports = widget.syncService.getAllReports();
    });
  }

  Future<void> _manualSync() async {
    await widget.syncService.syncPendingReports();
    _loadReports();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B140F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0E2218),
        title: const Row(
          children: [
            Icon(Icons.inventory_2_outlined, color: Color(0xFF00E676)),
            SizedBox(width: 8),
            Text(
              'FIELD INCIDENT CACHE',
              style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.1, fontSize: 16),
            ),
          ],
        ),
        actions: [
          ValueListenableBuilder<bool>(
            valueListenable: widget.syncService.isSyncingNotifier,
            builder: (context, isSyncing, child) {
              return IconButton(
                icon: isSyncing
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF00E676)),
                      )
                    : const Icon(Icons.sync, color: Color(0xFF00E676)),
                tooltip: 'Sync Buffer Now',
                onPressed: isSyncing ? null : _manualSync,
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: const Color(0xFF00E676),
        backgroundColor: const Color(0xFF13281E),
        onRefresh: () async {
          _manualSync();
        },
        child: Column(
          children: [
            // Connectivity & Buffer Telemetry Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: const Color(0xFF12241C),
              child: Row(
                children: [
                  ValueListenableBuilder<bool>(
                    valueListenable: widget.syncService.isOnlineNotifier,
                    builder: (context, isOnline, child) {
                      return Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isOnline ? const Color(0xFF00E676) : const Color(0xFFFF9100),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            isOnline ? 'NETWORK: ONLINE (AUTO-SYNC ACTIVE)' : 'NETWORK: OFFLINE (BUFFERING)',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isOnline ? const Color(0xFF00E676) : const Color(0xFFFF9100),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                  const Spacer(),
                  ValueListenableBuilder<int>(
                    valueListenable: widget.syncService.pendingCountNotifier,
                    builder: (context, count, child) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: count > 0 ? const Color(0xFFFF9100).withValues(alpha: 0.2) : Colors.white10,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '$count PENDING',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: count > 0 ? const Color(0xFFFF9100) : Colors.white60,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Reports List
            Expanded(
              child: _reports.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.assignment_turned_in_outlined, size: 54, color: Colors.white.withValues(alpha: 0.2)),
                          const SizedBox(height: 12),
                          const Text(
                            'NO FIELD REPORTS RECORDED YET',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.1,
                              color: Colors.white54,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Use Edge Scanner to detect wildlife or threats.',
                            style: TextStyle(fontSize: 11, color: Colors.white38),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _reports.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final report = _reports[index];
                        return _buildReportCard(report);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReportCard(IncidentReport report) {
    final dateFormat = DateFormat('yyyy-MM-dd HH:mm');
    final formattedDate = dateFormat.format(report.timestamp);

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF13281E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: report.isSynced ? const Color(0xFF1D3C2C) : const Color(0xFF4A3410),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Preview Thumbnail
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: 72,
                height: 72,
                color: Colors.black26,
                child: _buildThumbnail(report),
              ),
            ),
            const SizedBox(width: 14),

            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          report.label,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: report.isSynced
                              ? const Color(0xFF00E676).withValues(alpha: 0.15)
                              : const Color(0xFFFF9100).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: report.isSynced ? const Color(0xFF00E676) : const Color(0xFFFF9100),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              report.isSynced ? Icons.cloud_done : Icons.cloud_off,
                              size: 11,
                              color: report.isSynced ? const Color(0xFF00E676) : const Color(0xFFFF9100),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              report.isSynced ? 'SYNCED' : 'BUFFERED',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: report.isSynced ? const Color(0xFF00E676) : const Color(0xFFFF9100),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Confidence: ${(report.confidence * 100).toStringAsFixed(1)}% • $formattedDate',
                    style: const TextStyle(fontSize: 11, color: Colors.white60),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'GPS: ${report.lat.toStringAsFixed(4)}, ${report.lng.toStringAsFixed(4)}',
                    style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: Color(0xFF00E5FF)),
                  ),
                  if (report.notes.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      report.notes,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.white70),
                    ),
                  ],
                  if (report.syncError != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Sync Notice: ${report.syncError}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 10, color: Colors.redAccent),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThumbnail(IncidentReport report) {
    if (!kIsWeb && report.localImagePath.isNotEmpty && File(report.localImagePath).existsSync()) {
      return Image.file(
        File(report.localImagePath),
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => const Icon(Icons.broken_image, size: 24, color: Colors.white30),
      );
    } else if (report.localImagePath.startsWith('data:image/')) {
      try {
        final b64 = report.localImagePath.split(',').last;
        return Image.memory(
          base64Decode(b64),
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => const Icon(Icons.broken_image, size: 24, color: Colors.white30),
        );
      } catch (_) {}
    } else if (report.cloudinaryUrl.isNotEmpty) {
      return Image.network(
        report.cloudinaryUrl,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => const Icon(Icons.broken_image, size: 24, color: Colors.white30),
      );
    }
    return const Icon(Icons.photo_outlined, size: 28, color: Colors.white24);
  }
}
