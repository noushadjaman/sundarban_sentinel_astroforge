import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive_flutter/hive_flutter.dart';
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

  group('Instant Incident Report Reactive Loading Verification', () {
    late SyncService syncService;

    setUp(() async {
      Hive.init(Directory.systemTemp.path);
      syncService = SyncService();
      await syncService.initialize();
      syncService.isOnlineNotifier.value = false;
    });

    tearDown(() {
      syncService.dispose();
    });

    test('Saving a report immediately updates reportsNotifier and latestReportNotifier', () async {
      final initialCount = syncService.reportsNotifier.value.length;

      final dummyBytes = Uint8List.fromList([1, 2, 3, 4, 5, 6, 7, 8]);
      final report = await syncService.saveReportLocally(
        lat: 21.875,
        lng: 89.762,
        label: 'bengal_tiger',
        confidence: 0.98,
        imageBytes: dummyBytes,
        notes: 'Tiger spotted near Kotka stream',
      );

      // Verify immediate reactive notification
      expect(syncService.latestReportNotifier.value?.id, equals(report.id));
      expect(syncService.reportsNotifier.value.length, equals(initialCount + 1));
      expect(syncService.reportsNotifier.value.first.id, equals(report.id));
      expect(syncService.reportsNotifier.value.first.label, equals('bengal_tiger'));
      expect(syncService.reportsNotifier.value.first.notes, contains('Kotka stream'));
    });
  });
}
