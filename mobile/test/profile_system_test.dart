import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:sundarban_sentinel/models/incident_report.dart';
import 'package:sundarban_sentinel/models/user_profile.dart';
import 'package:sundarban_sentinel/services/profile_service.dart';
import 'package:sundarban_sentinel/services/sync_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  // Mock path_provider and connectivity plugins for test environment
  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(
    const MethodChannel('plugins.flutter.io/path_provider'),
    (MethodCall methodCall) async {
      return Directory.systemTemp.path;
    },
  );

  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(
    const MethodChannel('dev.fluttercommunity.plus/connectivity'),
    (MethodCall methodCall) async {
      return ['none'];
    },
  );

  late Directory tempDir;
  late ProfileService profileService;

  setUp(() async {
    tempDir = await Directory.systemTemp.createTemp('sundarban_profile_test_');
    Hive.init(tempDir.path);
    profileService = ProfileService();
    await profileService.initialize();
  });

  tearDown(() async {
    await Hive.close();
    if (tempDir.existsSync()) {
      await tempDir.delete(recursive: true);
    }
  });

  group('UserProfile Model Tests', () {
    test('serialization toMap and fromMap works correctly', () {
      final now = DateTime.now();
      final profile = UserProfile(
        name: 'Rafiqul Islam',
        phone: '01712345678',
        createdAt: now,
      );

      final map = profile.toMap();
      expect(map['name'], 'Rafiqul Islam');
      expect(map['phone'], '01712345678');

      final reconstructed = UserProfile.fromMap(map);
      expect(reconstructed.name, 'Rafiqul Islam');
      expect(reconstructed.phone, '01712345678');
      expect(reconstructed.createdAt.toIso8601String(), now.toIso8601String());
    });
  });

  group('ProfileService Tests', () {
    test('initially profile is incomplete if not configured', () {
      expect(profileService.currentProfile, isNull);
      expect(profileService.isProfileComplete, isFalse);
    });

    test('saveProfile persists and sets profileComplete to true', () async {
      final saved = await profileService.saveProfile(
        name: 'Tariqul Ranger',
        phone: '01899887766',
      );

      expect(saved.name, 'Tariqul Ranger');
      expect(saved.phone, '01899887766');
      expect(profileService.isProfileComplete, isTrue);
      expect(profileService.profileNotifier.value?.name, 'Tariqul Ranger');
    });

    test('calculateRewardBdt awards higher amounts for critical species and nets', () {
      expect(profileService.calculateRewardBdt('Royal Bengal Tiger'), 500);
      expect(profileService.calculateRewardBdt('Ganges River Dolphin'), 400);
      expect(profileService.calculateRewardBdt('Current Jal (Illegal Net)'), 350);
      expect(profileService.calculateRewardBdt('Spotted Deer (Chital)'), 300);
      expect(profileService.calculateRewardBdt('Lesser Adjutant Stork (Bird)'), 250);
      expect(profileService.calculateRewardBdt('Unknown Animal'), 200);
    });

    test('getRewardBengaliTitle returns Bengali titles for community honor', () {
      expect(profileService.getRewardBengaliTitle('Royal Bengal Tiger'), contains('বাঘ'));
      expect(profileService.getRewardBengaliTitle('Dolphin'), contains('ডলফিন'));
      expect(profileService.getRewardBengaliTitle('Current Jal'), contains('জাল'));
      expect(profileService.getRewardBengaliTitle('Spotted Deer'), contains('হরিণ'));
    });

    test('computeTotalEarnedRewards correctly calculates total earned bounty', () {
      final reports = [
        IncidentReport(
          id: 'rep_1',
          lat: 21.94,
          lng: 89.15,
          label: 'Royal Bengal Tiger',
          confidence: 0.94,
          localImagePath: '',
          timestamp: DateTime.now(),
          deviceId: 'dev_1',
          rewardAmountBdt: 500,
        ),
        IncidentReport(
          id: 'rep_2',
          lat: 21.82,
          lng: 89.65,
          label: 'Current Jal Net',
          confidence: 0.88,
          localImagePath: '',
          timestamp: DateTime.now(),
          deviceId: 'dev_1',
          rewardAmountBdt: 350,
        ),
        IncidentReport(
          id: 'rep_3',
          lat: 22.05,
          lng: 89.28,
          label: 'Spotted Deer',
          confidence: 0.91,
          localImagePath: '',
          timestamp: DateTime.now(),
          deviceId: 'dev_1',
          rewardAmountBdt: 300,
        ),
      ];

      final total = profileService.computeTotalEarnedRewards(reports);
      expect(total, 500 + 350 + 300); // 1150 BDT
    });
  });

  group('SyncService Profile & Reward Integration', () {
    test('saveReportLocally attaches reporter name, phone, and reward bounty', () async {
      await profileService.saveProfile(
        name: 'Mizanur Rahman',
        phone: '01511223344',
      );

      final syncService = SyncService();
      await syncService.initialize();
      syncService.isOnlineNotifier.value = false;

      final dummyBytes = Uint8List.fromList([1, 2, 3, 4, 5]);
      final report = await syncService.saveReportLocally(
        lat: 21.9497,
        lng: 89.1833,
        label: 'Royal Bengal Tiger',
        confidence: 0.92,
        imageBytes: dummyBytes,
        notes: 'Spotted near Dublar Char waterway',
      );

      expect(report.reporterName, 'Mizanur Rahman');
      expect(report.reporterPhone, '01511223344');
      expect(report.rewardAmountBdt, 500);
      expect(report.rewardStatus, 'PENDING_VERIFICATION');

      // Verify it appears in reportsNotifier
      final allReports = syncService.getAllReports();
      expect(allReports.isNotEmpty, isTrue);
      expect(allReports.first.reporterName, 'Mizanur Rahman');
      expect(allReports.first.rewardAmountBdt, 500);
    });
  });
}
