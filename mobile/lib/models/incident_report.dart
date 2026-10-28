class IncidentReport {
  final String id;
  final double lat;
  final double lng;
  final String label;
  final double confidence;
  final String localImagePath;
  String cloudinaryUrl;
  final DateTime timestamp;
  final String deviceId;
  String notes;
  bool isSynced;
  String? syncError;

  // Profile & Conservation Reward Tracking
  final String reporterName;
  final String reporterPhone;
  final int rewardAmountBdt;
  final String rewardStatus;

  IncidentReport({
    required this.id,
    required this.lat,
    required this.lng,
    required this.label,
    required this.confidence,
    required this.localImagePath,
    this.cloudinaryUrl = '',
    required this.timestamp,
    required this.deviceId,
    this.notes = '',
    this.isSynced = false,
    this.syncError,
    this.reporterName = 'Sundarban Sentinel',
    this.reporterPhone = '',
    this.rewardAmountBdt = 0,
    this.rewardStatus = 'PENDING_VERIFICATION',
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'lat': lat,
      'lng': lng,
      'label': label,
      'confidence': confidence,
      'localImagePath': localImagePath,
      'cloudinaryUrl': cloudinaryUrl,
      'timestamp': timestamp.toIso8601String(),
      'deviceId': deviceId,
      'notes': notes,
      'isSynced': isSynced,
      'syncError': syncError,
      'reporterName': reporterName,
      'reporterPhone': reporterPhone,
      'rewardAmountBdt': rewardAmountBdt,
      'rewardStatus': rewardStatus,
    };
  }

  factory IncidentReport.fromMap(Map<dynamic, dynamic> map) {
    return IncidentReport(
      id: map['id']?.toString() ?? '',
      lat: (map['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (map['lng'] as num?)?.toDouble() ?? 0.0,
      label: map['label']?.toString() ?? 'Unknown Detection',
      confidence: (map['confidence'] as num?)?.toDouble() ?? 0.0,
      localImagePath: map['localImagePath']?.toString() ?? '',
      cloudinaryUrl: map['cloudinaryUrl']?.toString() ?? '',
      timestamp: DateTime.tryParse(map['timestamp']?.toString() ?? '') ?? DateTime.now(),
      deviceId: map['deviceId']?.toString() ?? 'ranger_edge_01',
      notes: map['notes']?.toString() ?? '',
      isSynced: map['isSynced'] == true,
      syncError: map['syncError']?.toString(),
      reporterName: map['reporterName']?.toString() ?? 'Sundarban Sentinel',
      reporterPhone: map['reporterPhone']?.toString() ?? '',
      rewardAmountBdt: (map['rewardAmountBdt'] as num?)?.toInt() ?? 0,
      rewardStatus: map['rewardStatus']?.toString() ?? 'PENDING_VERIFICATION',
    );
  }
}
