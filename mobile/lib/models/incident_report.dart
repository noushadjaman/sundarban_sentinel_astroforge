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
    );
  }
}
