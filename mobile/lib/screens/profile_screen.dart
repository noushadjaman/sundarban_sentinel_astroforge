import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/incident_report.dart';
import '../models/user_profile.dart';
import '../services/profile_service.dart';
import '../services/sync_service.dart';
import '../widgets/incident_detail_sheet.dart';
import '../widgets/profile_setup_dialog.dart';
import 'main_scaffold.dart';

class ProfileScreen extends StatefulWidget {
  final SyncService syncService;
  final ProfileService? profileService;

  const ProfileScreen({
    super.key,
    required this.syncService,
    this.profileService,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late final ProfileService _profileService;
  String _filter = 'ALL'; // ALL, WILDLIFE, NETS

  @override
  void initState() {
    super.initState();
    _profileService = widget.profileService ?? ProfileService();
  }

  void _openProfileEditor() async {
    await ProfileSetupDialog.show(
      context,
      profileService: _profileService,
      reason: 'Update your Name and Mobile Number for reward disbursements',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF07110C),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0C1F16),
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.shield_rounded, color: Color(0xFF00E676), size: 20),
            SizedBox(width: 8),
            Text(
              'GUARDIAN PROFILE & REWARDS',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                letterSpacing: 1.1,
                fontSize: 15,
                color: Colors.white,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Edit Profile / প্রোফাইল সম্পাদনা',
            icon: const Icon(Icons.edit_note_rounded, color: Color(0xFF00E676), size: 24),
            onPressed: _openProfileEditor,
          ),
        ],
      ),
      body: ValueListenableBuilder<UserProfile?>(
        valueListenable: _profileService.profileNotifier,
        builder: (context, userProfile, child) {
          return ValueListenableBuilder<List<IncidentReport>>(
            valueListenable: widget.syncService.reportsNotifier,
            builder: (context, allReports, _) {
              final totalRewards = _profileService.computeTotalEarnedRewards(allReports);
              final savedWildlifeCount = allReports.where((r) {
                final l = r.label.toLowerCase();
                return l.contains('tiger') ||
                    l.contains('dolphin') ||
                    l.contains('deer') ||
                    l.contains('bird') ||
                    l.contains('adjutant');
              }).length;
              final netsSeizedCount = allReports.where((r) {
                final l = r.label.toLowerCase();
                return l.contains('net') || l.contains('jal') || l.contains('poach');
              }).length;

              final filteredReports = allReports.where((r) {
                if (_filter == 'WILDLIFE') {
                  final l = r.label.toLowerCase();
                  return l.contains('tiger') ||
                      l.contains('dolphin') ||
                      l.contains('deer') ||
                      l.contains('bird') ||
                      l.contains('adjutant');
                } else if (_filter == 'NETS') {
                  final l = r.label.toLowerCase();
                  return l.contains('net') || l.contains('jal');
                }
                return true;
              }).toList();

              return SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Profile Header Card
                    _buildProfileHeader(userProfile),

                    const SizedBox(height: 16),

                    // Rewards Summary Card
                    _buildRewardsDashboard(
                      totalRewards: totalRewards,
                      savedWildlifeCount: savedWildlifeCount,
                      netsSeizedCount: netsSeizedCount,
                      reportsCount: allReports.length,
                    ),

                    const SizedBox(height: 16),

                    // How Rewards Work Guide Card
                    _buildRewardRateGuide(),

                    const SizedBox(height: 20),

                    // Section Title: Recorded Incidents & Bounties
                    Row(
                      children: [
                        const Icon(Icons.history_edu_rounded, color: Color(0xFF00E676), size: 20),
                        const SizedBox(width: 8),
                        const Text(
                          'RECORDED INCIDENTS & BOUNTIES',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            color: Colors.white,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00E676).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '${filteredReports.length} REPORTS',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF00E676),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 10),

                    // Filter Chips
                    Row(
                      children: [
                        _buildFilterChip('ALL', 'All (${allReports.length})'),
                        const SizedBox(width: 8),
                        _buildFilterChip('WILDLIFE', 'Wildlife ($savedWildlifeCount)'),
                        const SizedBox(width: 8),
                        _buildFilterChip('NETS', 'Nets ($netsSeizedCount)'),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // Incidents List or Empty State
                    if (filteredReports.isEmpty)
                      _buildEmptyState()
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filteredReports.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final report = filteredReports[index];
                          return _buildIncidentCard(report);
                        },
                      ),

                    const SizedBox(height: 30),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildProfileHeader(UserProfile? profile) {
    final isConfigured = profile != null && profile.name.isNotEmpty && profile.phone.isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F261B), Color(0xFF133624)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isConfigured ? const Color(0xFF00E676) : const Color(0xFFFF9100),
          width: 1.4,
        ),
        boxShadow: [
          BoxShadow(
            color: (isConfigured ? const Color(0xFF00E676) : const Color(0xFFFF9100)).withValues(alpha: 0.15),
            blurRadius: 16,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Avatar
              Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF00E676).withValues(alpha: 0.15),
                  border: Border.all(
                    color: isConfigured ? const Color(0xFF00E676) : const Color(0xFFFF9100),
                    width: 2,
                  ),
                ),
                child: Center(
                  child: Text(
                    isConfigured && profile.name.isNotEmpty
                        ? profile.name.substring(0, 1).toUpperCase()
                        : '?',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: isConfigured ? const Color(0xFF00E676) : const Color(0xFFFF9100),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),

              // Name and Phone
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isConfigured ? profile.name : 'Sundarban Guardian (Unconfigured)',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.phone_iphone_rounded, color: Color(0xFF00E5FF), size: 14),
                        const SizedBox(width: 4),
                        Text(
                          isConfigured ? profile.phone : 'No phone linked yet',
                          style: TextStyle(
                            fontSize: 12,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.w600,
                            color: isConfigured ? const Color(0xFF00E5FF) : Colors.white38,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00E676).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'সুন্দরবন বন্যপ্রাণী রক্ষক • SUNDARBAN ECO SENTINEL',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF81C784),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Edit Button
              IconButton(
                onPressed: _openProfileEditor,
                icon: const Icon(Icons.edit, color: Color(0xFF00E676), size: 20),
                tooltip: 'Edit Profile',
              ),
            ],
          ),

          if (!isConfigured) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFFF9100).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFFF9100).withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: Color(0xFFFF9100), size: 16),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Profile required to report incidents and receive cash bounties via bKash/Nagad.',
                      style: TextStyle(fontSize: 11, color: Colors.white70),
                    ),
                  ),
                  const SizedBox(width: 6),
                  ElevatedButton(
                    onPressed: _openProfileEditor,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF9100),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      minimumSize: Size.zero,
                    ),
                    child: const Text(
                      'SETUP',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRewardsDashboard({
    required int totalRewards,
    required int savedWildlifeCount,
    required int netsSeizedCount,
    required int reportsCount,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF13281E), Color(0xFF0B1912)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFFD700).withValues(alpha: 0.6), width: 1.4),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFFFD700).withValues(alpha: 0.12),
            blurRadius: 18,
            spreadRadius: 1,
          ),
        ],
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
                child: const Icon(Icons.stars_rounded, color: Color(0xFFFFD700), size: 22),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'CONSERVATION REWARDS EARNED',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.8,
                        color: Color(0xFFFFD700),
                      ),
                    ),
                    Text(
                      'বন্যপ্রাণী ও সুন্দরবন রক্ষা ইনসেন্টিভ অনুদান',
                      style: TextStyle(fontSize: 10, color: Colors.white60),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF00E5FF).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.4)),
                ),
                child: const Text(
                  'bKash / Nagad',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF00E5FF),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Big Total Amount Display
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              const Text(
                '৳',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF00E676),
                ),
              ),
              const SizedBox(width: 4),
              Text(
                NumberFormat('#,###').format(totalRewards),
                style: const TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'BDT TOTAL REWARD',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.6,
                  color: Color(0xFF81C784),
                ),
              ),
            ],
          ),

          const SizedBox(height: 4),
          const Text(
            'Rewarding community members who help save wildlife & protect the Sundarbans mangrove ecosystem.',
            style: TextStyle(fontSize: 10.5, color: Colors.white70, height: 1.3),
          ),

          const Divider(color: Colors.white12, height: 20),

          // Stats Metric Row
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  icon: Icons.pets_rounded,
                  iconColor: const Color(0xFFFFB300),
                  label: 'ANIMALS SAVED',
                  value: '$savedWildlifeCount',
                  subtext: 'Tigers, Deer, Dolphins',
                ),
              ),
              Container(width: 1, height: 42, color: Colors.white12),
              Expanded(
                child: _buildMetricTile(
                  icon: Icons.filter_alt_off_rounded,
                  iconColor: const Color(0xFFFF5252),
                  label: 'NETS SEIZED',
                  value: '$netsSeizedCount',
                  subtext: 'Illegal monofilament',
                ),
              ),
              Container(width: 1, height: 42, color: Colors.white12),
              Expanded(
                child: _buildMetricTile(
                  icon: Icons.assignment_turned_in_rounded,
                  iconColor: const Color(0xFF00E676),
                  label: 'TOTAL REPORTS',
                  value: '$reportsCount',
                  subtext: 'Filed by you',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required String subtext,
  }) {
    return Column(
      children: [
        Icon(icon, color: iconColor, size: 18),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 8.5,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.4,
            color: Colors.white60,
          ),
        ),
      ],
    );
  }

  Widget _buildRewardRateGuide() {
    final rates = [
      {'name': 'Royal Bengal Tiger (বাঘ)', 'bounty': '৳500 BDT', 'color': const Color(0xFFFFB300)},
      {'name': 'Ganges / Irrawaddy Dolphin (ডলফিন)', 'bounty': '৳400 BDT', 'color': const Color(0xFF00E5FF)},
      {'name': 'Current Net Seizure (কারেন্ট জাল)', 'bounty': '৳350 BDT', 'color': const Color(0xFFFF5252)},
      {'name': 'Spotted Deer (চিত্রা হরিণ)', 'bounty': '৳300 BDT', 'color': const Color(0xFF69F0AE)},
      {'name': 'Endangered Birds (বিপন্ন পাখি)', 'bounty': '৳250 BDT', 'color': const Color(0xFFE040FB)},
    ];

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1E16),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1B3D2B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.monetization_on_rounded, color: Color(0xFF00E676), size: 16),
              SizedBox(width: 8),
              Text(
                'CONSERVATION REWARD BOUNTY POLICY',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.6,
                  color: Color(0xFF00E676),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Direct financial rewards sent to your mobile phone number when you assist in rescuing animals or locating illegal traps.',
            style: TextStyle(fontSize: 10, color: Colors.white54),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: rates.map((r) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF07140E),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: (r['color'] as Color).withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      r['name'] as String,
                      style: const TextStyle(fontSize: 10, color: Colors.white70),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      r['bounty'] as String,
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        color: r['color'] as Color,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _filter == key;
    return GestureDetector(
      onTap: () => setState(() => _filter = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF00E676) : const Color(0xFF13281E),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? const Color(0xFF00E676) : const Color(0xFF1E3A2E),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black : Colors.white70,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF0A1811),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF193224)),
      ),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF00E676).withValues(alpha: 0.12),
              border: Border.all(color: const Color(0xFF00E676).withValues(alpha: 0.4)),
            ),
            child: const Icon(Icons.camera_alt_outlined, color: Color(0xFF00E676), size: 30),
          ),
          const SizedBox(height: 14),
          const Text(
            'No Recorded Wildlife Incidents Yet',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Photograph wildlife in distress or illegal nets to record incidents and earn conservation rewards directly to your mobile wallet.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, color: Colors.white60, height: 1.4),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => MainScaffold.switchToTab(context, 1),
            icon: const Icon(Icons.center_focus_strong, color: Colors.black, size: 18),
            label: const Text(
              'OPEN SCANNER',
              style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00E676),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIncidentCard(IncidentReport report) {
    final dateFormat = DateFormat('MMM dd, yyyy • hh:mm a');
    final formattedDate = dateFormat.format(report.timestamp);
    final rewardAmount = report.rewardAmountBdt > 0
        ? report.rewardAmountBdt
        : _profileService.calculateRewardBdt(report.label);

    return InkWell(
      onTap: () => IncidentDetailSheet.show(
        context,
        report: report,
        syncService: widget.syncService,
      ),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0C1D15),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF1B3D2B)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail
            _buildThumbnail(report),
            const SizedBox(width: 12),

            // Content
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
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFD700).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFFFD700)),
                        ),
                        child: Text(
                          '+৳$rewardAmount BDT',
                          style: const TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFFFFD700),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    _profileService.getRewardBengaliTitle(report.label),
                    style: const TextStyle(fontSize: 10.5, color: Color(0xFF81C784)),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.access_time_rounded, size: 11, color: Colors.white54),
                      const SizedBox(width: 4),
                      Text(
                        formattedDate,
                        style: const TextStyle(fontSize: 10, color: Colors.white54),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(Icons.gps_fixed, size: 11, color: Color(0xFF00E5FF)),
                      const SizedBox(width: 4),
                      Text(
                        '${report.lat.toStringAsFixed(4)}, ${report.lng.toStringAsFixed(4)}',
                        style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF00E5FF)),
                      ),
                      const Spacer(),
                      Text(
                        report.isSynced ? '✓ SYNCED' : 'OFFLINE BUFFERED',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: report.isSynced ? const Color(0xFF00E676) : const Color(0xFFFF9100),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThumbnail(IncidentReport report) {
    if (report.localImagePath.startsWith('data:image/')) {
      try {
        final b64 = report.localImagePath.split(',').last;
        final bytes = base64Decode(b64);
        return ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: Image.memory(bytes, width: 64, height: 64, fit: BoxFit.cover),
        );
      } catch (_) {}
    } else if (!kIsWeb && report.localImagePath.isNotEmpty) {
      final file = File(report.localImagePath);
      if (file.existsSync()) {
        return ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: Image.file(file, width: 64, height: 64, fit: BoxFit.cover),
        );
      }
    }

    if (report.cloudinaryUrl.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Image.network(
          report.cloudinaryUrl,
          width: 64,
          height: 64,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _buildFallbackThumbnail(),
        ),
      );
    }

    return _buildFallbackThumbnail();
  }

  Widget _buildFallbackThumbnail() {
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: const Color(0xFF13281E),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF1E3A2E)),
      ),
      child: const Center(
        child: Icon(Icons.pets, color: Color(0xFF00E676), size: 28),
      ),
    );
  }
}
