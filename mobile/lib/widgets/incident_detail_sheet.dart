import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/incident_report.dart';
import '../services/legal_registry_service.dart';
import '../services/sync_service.dart';

class IncidentDetailSheet extends StatelessWidget {
  final IncidentReport report;
  final SyncService? syncService;
  final VoidCallback? onViewInVault;

  const IncidentDetailSheet({
    super.key,
    required this.report,
    this.syncService,
    this.onViewInVault,
  });

  static Future<void> show(
    BuildContext context, {
    required IncidentReport report,
    SyncService? syncService,
    VoidCallback? onViewInVault,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => IncidentDetailSheet(
        report: report,
        syncService: syncService,
        onViewInVault: onViewInVault,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final law = LegalRegistryService.lookup(report.label);
    final dateFormat = DateFormat('yyyy-MM-dd HH:mm:ss');
    final formattedDate = dateFormat.format(report.timestamp);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.90,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFF0C1912),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border.all(
          color: report.isSynced ? const Color(0xFF00E676) : const Color(0xFFFF9100),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: (report.isSynced ? const Color(0xFF00E676) : const Color(0xFFFF9100))
                .withValues(alpha: 0.3),
            blurRadius: 25,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag Handle
          const SizedBox(height: 12),
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 14),

          // Scrollable Content
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Title & Sync Status Row
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00E676).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF00E676)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.check_circle_rounded, size: 13, color: Color(0xFF00E676)),
                            SizedBox(width: 5),
                            Text(
                              'INCIDENT REPORT LOADED',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.8,
                                color: Color(0xFF00E676),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: report.isSynced
                              ? const Color(0xFF00E676).withValues(alpha: 0.2)
                              : const Color(0xFFFF9100).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: report.isSynced ? const Color(0xFF00E676) : const Color(0xFFFF9100),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          report.isSynced ? 'CLOUD SYNCED' : 'OFFLINE BUFFERED',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                            color: report.isSynced ? const Color(0xFF00E676) : const Color(0xFFFF9100),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Report ID
                  Text(
                    'Ticket ID: ${report.id}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontFamily: 'monospace',
                      color: Colors.white54,
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Image Preview
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      width: double.infinity,
                      height: 200,
                      color: const Color(0xFF06100B),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          _buildImage(report),
                          Positioned(
                            bottom: 10,
                            left: 10,
                            right: 10,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.75),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.white12),
                              ),
                              child: Row(
                                children: [
                                  Text(
                                    report.label.toUpperCase(),
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const Spacer(),
                                  Text(
                                    'CONFIDENCE: ${(report.confidence * 100).toStringAsFixed(1)}%',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF00E676),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Statutory Legal Intelligence Card (if law found)
                  if (law != null) ...[
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF13281E),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: law.isStrictlyProhibited
                              ? const Color(0xFFFF5252)
                              : const Color(0xFF00E5FF),
                          width: 1.2,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                law.bengaliName,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: law.isBailable
                                      ? Colors.blue.withValues(alpha: 0.2)
                                      : Colors.red.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  law.bailableStatus,
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: law.isBailable ? Colors.lightBlueAccent : const Color(0xFFFF5252),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            law.actName,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF81C784),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            law.section,
                            style: const TextStyle(
                              fontSize: 11,
                              fontFamily: 'monospace',
                              color: Color(0xFF00E5FF),
                            ),
                          ),
                          const Divider(color: Colors.white12, height: 16),
                          Text(
                            'দণ্ডাদেশ: ${law.punishment}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Colors.white70,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                  ],

                  // Conservation Bounty & Reporter Attribution Card
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1B3828), Color(0xFF0F261B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFFFD700).withValues(alpha: 0.6), width: 1.2),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFD700).withValues(alpha: 0.2),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.workspace_premium_rounded, color: Color(0xFFFFD700), size: 20),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'CONSERVATION REWARD BOUNTY',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.8,
                                color: Color(0xFFFFD700),
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF00E676).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFF00E676)),
                              ),
                              child: Text(
                                '+৳${report.rewardAmountBdt > 0 ? report.rewardAmountBdt : 300} BDT',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF00E676),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'REPORTER / বন্যপ্রাণী রক্ষক',
                                    style: TextStyle(fontSize: 10, color: Colors.white54, letterSpacing: 0.5),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    report.reporterName.isNotEmpty ? report.reporterName : 'Sundarban Guardian',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                            if (report.reporterPhone.isNotEmpty)
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text(
                                      'PAYOUT WALLET (bKash)',
                                      style: TextStyle(fontSize: 10, color: Colors.white54, letterSpacing: 0.5),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      report.reporterPhone,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF00E5FF),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Telemetry & GPS Metadata
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F2218),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Column(
                      children: [
                        _buildMetaRow(
                          icon: Icons.gps_fixed,
                          label: 'COORDINATES',
                          value: '${report.lat.toStringAsFixed(5)}° N, ${report.lng.toStringAsFixed(5)}° E',
                          color: const Color(0xFF00E5FF),
                        ),
                        const Divider(color: Colors.white10, height: 16),
                        _buildMetaRow(
                          icon: Icons.access_time_rounded,
                          label: 'TIMESTAMP',
                          value: formattedDate,
                          color: Colors.white70,
                        ),
                        const Divider(color: Colors.white10, height: 16),
                        _buildMetaRow(
                          icon: Icons.phone_android_rounded,
                          label: 'DEVICE ID',
                          value: report.deviceId,
                          color: Colors.white54,
                        ),
                        if (report.notes.isNotEmpty) ...[
                          const Divider(color: Colors.white10, height: 16),
                          _buildMetaRow(
                            icon: Icons.notes_rounded,
                            label: 'FIELD LOG',
                            value: report.notes,
                            color: const Color(0xFFFFD54F),
                          ),
                        ],
                        if (report.cloudinaryUrl.isNotEmpty) ...[
                          const Divider(color: Colors.white10, height: 16),
                          _buildMetaRow(
                            icon: Icons.cloud_done_rounded,
                            label: 'CLOUD BACKUP',
                            value: 'Verified & Securely Synced',
                            color: const Color(0xFF00E676),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),

          // Bottom Action Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF09140E),
              border: Border(top: BorderSide(color: Color(0xFF1B3B2B), width: 1)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white70,
                      side: const BorderSide(color: Colors.white24),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('DISMISS'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      onViewInVault?.call();
                    },
                    icon: const Icon(Icons.inventory_2_rounded, color: Colors.black),
                    label: const Text(
                      'VIEW ALL INCIDENTS',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                        letterSpacing: 0.5,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00E676),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetaRow({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: color),
        const SizedBox(width: 10),
        Text(
          '$label:',
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.7,
            color: Colors.white38,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildImage(IncidentReport report) {
    if (!kIsWeb && report.localImagePath.isNotEmpty && File(report.localImagePath).existsSync()) {
      return Image.file(
        File(report.localImagePath),
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => const Center(
          child: Icon(Icons.broken_image, size: 36, color: Colors.white30),
        ),
      );
    } else if (report.localImagePath.startsWith('data:image/')) {
      try {
        final b64 = report.localImagePath.split(',').last;
        return Image.memory(
          base64Decode(b64),
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => const Center(
            child: Icon(Icons.broken_image, size: 36, color: Colors.white30),
          ),
        );
      } catch (_) {}
    } else if (report.cloudinaryUrl.isNotEmpty) {
      return Image.network(
        report.cloudinaryUrl,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => const Center(
          child: Icon(Icons.broken_image, size: 36, color: Colors.white30),
        ),
      );
    }
    return const Center(
      child: Icon(Icons.photo_outlined, size: 36, color: Colors.white24),
    );
  }
}
