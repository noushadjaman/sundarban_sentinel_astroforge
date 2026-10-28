import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/incident_report.dart';
import '../services/sync_service.dart';
import '../widgets/incident_detail_sheet.dart';

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
  @override
  void initState() {
    super.initState();
    widget.syncService.reportsNotifier.addListener(_onReportsChanged);
  }

  @override
  void dispose() {
    widget.syncService.reportsNotifier.removeListener(_onReportsChanged);
    super.dispose();
  }

  void _onReportsChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _manualSync() async {
    await widget.syncService.syncPendingReports();
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
              'RECORDED INCIDENTS',
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
                            isOnline ? 'ONLINE • AUTO-SYNC ACTIVE' : 'OFFLINE • LOCAL STORAGE ACTIVE',
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

            // Reports List (Realtime Reactive)
            Expanded(
              child: ValueListenableBuilder<List<IncidentReport>>(
                valueListenable: widget.syncService.reportsNotifier,
                builder: (context, reports, child) {
                  if (reports.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.assignment_turned_in_outlined,
                              size: 54, color: Colors.white.withValues(alpha: 0.2)),
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
                            'Use the Scanner tab to record wildlife and threats.',
                            style: TextStyle(fontSize: 11, color: Colors.white38),
                          ),
                        ],
                      ),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: reports.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final report = reports[index];
                      return _buildReportCard(report, isNewest: index == 0);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReportCard(IncidentReport report, {bool isNewest = false}) {
    final dateFormat = DateFormat('yyyy-MM-dd HH:mm');
    final formattedDate = dateFormat.format(report.timestamp);

    return InkWell(
      onTap: () {
        IncidentDetailSheet.show(
          context,
          report: report,
          syncService: widget.syncService,
        );
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF13281E),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isNewest
                ? const Color(0xFF00E676)
                : (report.isSynced ? const Color(0xFF1D3C2C) : const Color(0xFF4A3410)),
            width: isNewest ? 1.6 : 1.0,
          ),
          boxShadow: isNewest
              ? [
                  BoxShadow(
                    color: const Color(0xFF00E676).withValues(alpha: 0.2),
                    blurRadius: 8,
                  ),
                ]
              : null,
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
                        if (isNewest) ...[
                          Container(
                            margin: const EdgeInsets.only(right: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF00E676).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFF00E676), width: 0.8),
                            ),
                            child: const Text(
                              'NEW',
                              style: TextStyle(
                                fontSize: 8,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF00E676),
                              ),
                            ),
                          ),
                        ],
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
                  const SizedBox(height: 5),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFD700).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: const Color(0xFFFFD700).withValues(alpha: 0.5)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.workspace_premium_rounded, size: 11, color: Color(0xFFFFD700)),
                            const SizedBox(width: 4),
                            Text(
                              '+৳${report.rewardAmountBdt > 0 ? report.rewardAmountBdt : 300} BDT',
                              style: const TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFFFD700),
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (report.reporterName.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'By: ${report.reporterName}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 10, color: Colors.white54),
                          ),
                        ),
                      ],
                    ],
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
