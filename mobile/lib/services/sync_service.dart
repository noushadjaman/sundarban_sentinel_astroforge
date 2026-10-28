import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart';
import '../models/incident_report.dart';
import 'cloudinary_service.dart';
import 'api_service.dart';
import 'profile_service.dart';

class SyncService {
  static const String boxName = 'reports_box';

  final CloudinaryService cloudinaryService;
  final ApiService apiService;

  Box? _box;
  StreamSubscription? _connectivitySub;
  StreamSubscription? _boxSub;

  final ValueNotifier<bool> isSyncingNotifier = ValueNotifier<bool>(false);
  final ValueNotifier<bool> isOnlineNotifier = ValueNotifier<bool>(true);
  final ValueNotifier<int> pendingCountNotifier = ValueNotifier<int>(0);
  final ValueNotifier<List<IncidentReport>> reportsNotifier = ValueNotifier<List<IncidentReport>>([]);
  final ValueNotifier<IncidentReport?> latestReportNotifier = ValueNotifier<IncidentReport?>(null);

  SyncService({
    CloudinaryService? cloudinary,
    ApiService? api,
  })  : cloudinaryService = cloudinary ?? CloudinaryService(),
        apiService = api ?? ApiService();

  Future<void> initialize() async {
    // 1. Initialize Hive
    await Hive.initFlutter();
    _box = await Hive.openBox(boxName);
    _updateReportsState();

    // Watch box for instant reactive updates across the entire app
    _boxSub = _box?.watch().listen((_) {
      _updateReportsState();
    });

    // 2. Initial connectivity check
    final initialStatus = await Connectivity().checkConnectivity();
    _updateOnlineStatus(initialStatus);

    // 3. Listen to network transitions
    _connectivitySub = Connectivity().onConnectivityChanged.listen((statusList) {
      final wasOffline = !isOnlineNotifier.value;
      _updateOnlineStatus(statusList);

      // On reconnect trigger background auto-sync
      if (wasOffline && isOnlineNotifier.value) {
        // ignore: avoid_print
        print('[SyncService] Network reconnected! Triggering background auto-sync...');
        syncPendingReports();
      }
    });
  }

  void _updateOnlineStatus(List<ConnectivityResult> results) {
    final online = results.any(
      (r) =>
          r == ConnectivityResult.wifi ||
          r == ConnectivityResult.mobile ||
          r == ConnectivityResult.ethernet,
    );
    isOnlineNotifier.value = online;
  }

  void _updatePendingCount() {
    pendingCountNotifier.value = getPendingReports().length;
  }

  void _updateReportsState() {
    _updatePendingCount();
    reportsNotifier.value = getAllReports();
  }

  /// Saves a new incident capture locally in Hive with binary image persistence
  Future<IncidentReport> saveReportLocally({
    required double lat,
    required double lng,
    required String label,
    required double confidence,
    required Uint8List imageBytes,
    String notes = '',
    String deviceId = 'ranger_field_01',
    String? reporterName,
    String? reporterPhone,
    int? rewardAmountBdt,
    String? rewardStatus,
  }) async {
    final box = _box ?? await Hive.openBox(boxName);

    String localPath = '';
    if (!kIsWeb) {
      try {
        final appDir = await getApplicationDocumentsDirectory();
        final fileName = 'report_${DateTime.now().millisecondsSinceEpoch}.jpg';
        final localFile = File('${appDir.path}/$fileName');
        await localFile.writeAsBytes(imageBytes);
        localPath = localFile.path;
      } catch (_) {}
    } else {
      // On web, keep base64 representation in localImagePath if file system not available
      localPath = 'data:image/jpeg;base64,${base64Encode(imageBytes)}';
    }

    final currentProfile = ProfileService().currentProfile;
    final finalReporterName = (reporterName != null && reporterName.trim().isNotEmpty)
        ? reporterName.trim()
        : (currentProfile?.name.isNotEmpty == true ? currentProfile!.name : 'Sundarban Sentinel');
    final finalReporterPhone = (reporterPhone != null && reporterPhone.trim().isNotEmpty)
        ? reporterPhone.trim()
        : (currentProfile?.phone ?? '');
    final finalRewardAmount = rewardAmountBdt ?? ProfileService().calculateRewardBdt(label);
    final finalRewardStatus = rewardStatus ?? 'PENDING_VERIFICATION';

    final report = IncidentReport(
      id: 'rep_${DateTime.now().millisecondsSinceEpoch}_${imageBytes.length.toRadixString(16)}',
      lat: lat,
      lng: lng,
      label: label,
      confidence: confidence,
      localImagePath: localPath,
      timestamp: DateTime.now(),
      deviceId: deviceId,
      notes: notes,
      isSynced: false,
      reporterName: finalReporterName,
      reporterPhone: finalReporterPhone,
      rewardAmountBdt: finalRewardAmount,
      rewardStatus: finalRewardStatus,
    );

    // Store raw bytes in Hive for web or offline sync
    await box.put(report.id, report.toMap());
    latestReportNotifier.value = report;
    _updateReportsState();

    // If online, immediately attempt async upload
    if (isOnlineNotifier.value) {
      unawaited(syncSingleReport(report, rawBytes: imageBytes));
    }

    return report;
  }

  List<IncidentReport> getAllReports() {
    if (_box == null) return [];
    final reports = <IncidentReport>[];
    for (final key in _box!.keys) {
      final data = _box!.get(key);
      if (data is Map) {
        reports.add(IncidentReport.fromMap(data));
      }
    }
    reports.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return reports;
  }

  List<IncidentReport> getPendingReports() {
    return getAllReports().where((r) => !r.isSynced).toList();
  }

  /// Sync a single report: (1) Cloudinary Upload -> (2) Cloudflare Worker Ingest -> (3) Hive update
  Future<bool> syncSingleReport(IncidentReport report, {Uint8List? rawBytes}) async {
    try {
      // Step 1: Upload image binary to Cloudinary CDN if not uploaded yet
      if (report.cloudinaryUrl.isEmpty) {
        if (rawBytes != null && rawBytes.isNotEmpty) {
          final secureUrl = await cloudinaryService.uploadImageBytes(bytes: rawBytes);
          report.cloudinaryUrl = secureUrl;
        } else if (report.localImagePath.startsWith('data:image/')) {
          final b64 = report.localImagePath.split(',').last;
          final bytes = base64Decode(b64);
          final secureUrl = await cloudinaryService.uploadImageBytes(bytes: bytes);
          report.cloudinaryUrl = secureUrl;
        } else if (!kIsWeb && report.localImagePath.isNotEmpty && File(report.localImagePath).existsSync()) {
          final secureUrl = await cloudinaryService.uploadImageFile(report.localImagePath);
          report.cloudinaryUrl = secureUrl;
        } else {
          report.cloudinaryUrl =
              'https://res.cloudinary.com/dsnb5jiht/image/upload/v1790508669/ehs73owhrnw8kljtszgs.png';
        }
      }

      // Step 2: Post payload to Cloudflare Worker /api/v1/reports/ingest
      await apiService.postFieldReport(report);

      // Step 3: Update local Hive record to isSynced = true
      report.isSynced = true;
      report.syncError = null;
      await _box?.put(report.id, report.toMap());
      _updateReportsState();
      return true;
    } catch (e) {
      // ignore: avoid_print
      print('[SyncService] Sync failed for ${report.id}: $e');
      report.syncError = e.toString();
      await _box?.put(report.id, report.toMap());
      _updateReportsState();
      return false;
    }
  }

  /// Sync all pending unsynced captures
  Future<void> syncPendingReports() async {
    if (isSyncingNotifier.value) return;

    final pending = getPendingReports();
    if (pending.isEmpty) return;

    isSyncingNotifier.value = true;
    for (final report in pending) {
      await syncSingleReport(report);
    }

    isSyncingNotifier.value = false;
    _updateReportsState();
  }

  void dispose() {
    _connectivitySub?.cancel();
    _boxSub?.cancel();
    _box?.close();
  }
}
