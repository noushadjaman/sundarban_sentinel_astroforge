import 'dart:typed_data';
import 'dart:ui';
import '../models/wildlife_law.dart';
import 'legal_registry_service.dart';

class DetectionResult {
  final String label;
  final double confidence;
  final Rect boundingBox;
  final int classIndex;

  DetectionResult({
    required this.label,
    required this.confidence,
    required this.boundingBox,
    required this.classIndex,
  });

  WildlifeLaw? get legalInfo => LegalRegistryService.lookup(label);

  bool get isHighRisk {
    final law = legalInfo;
    if (law != null) {
      return law.isStrictlyProhibited || law.isBannedGearOrPractice;
    }
    final normalized = label.toLowerCase();
    return normalized.contains('tiger') ||
        normalized.contains('jal') ||
        normalized.contains('dolphin');
  }

  String get formattedConfidence => '${(confidence * 100).toStringAsFixed(1)}%';

  @override
  String toString() => '$label ($formattedConfidence)';
}

class ClassifierService {
  static const int inputSize = 640;
  static const double confidenceThreshold = 0.40;
  static const double iouThreshold = 0.45;

  bool get isReady => false;
  List<String> get labels => const [
        'bengal_tiger',
        'chital_deer',
        'current_jal',
        'ganges_dolphin',
        'lesser_adjutant',
      ];

  Future<void> initialize() async {}
  Future<List<DetectionResult>> detect(Uint8List imageBytes) async => [];
  void dispose() {}
}
