import 'dart:io';
import 'dart:ui';
import 'package:flutter_test/flutter_test.dart';
import 'package:sundarban_sentinel/services/tflite_service.dart';
import 'package:sundarban_sentinel/services/legal_registry_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const targetClasses = [
    'bengal_tiger',
    'chital_deer',
    'current_jal',
    'ganges_dolphin',
    'lesser_adjutant',
  ];

  group('Checklist 1: Asset Verification', () {
    test('Model and labels assets exist on filesystem', () {
      final modelFile = File('assets/models/model.tflite');
      final labelsFile = File('assets/models/labels.txt');
      final lawsFile = File('assets/data/bangladesh_wildlife_laws.json');

      expect(modelFile.existsSync(), isTrue, reason: 'assets/models/model.tflite missing');
      expect(modelFile.lengthSync(), greaterThan(1000000), reason: 'Model size should be ~3.3MB INT8');

      expect(labelsFile.existsSync(), isTrue, reason: 'assets/models/labels.txt missing');
      final labels = labelsFile.readAsLinesSync().map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      expect(labels, equals(targetClasses));

      expect(lawsFile.existsSync(), isTrue, reason: 'assets/data/bangladesh_wildlife_laws.json missing');
    });
  });

  group('Checklist 2: TFLite Edge Detector Service', () {
    late TFLiteService service;

    setUp(() {
      service = TFLiteService();
    });

    test('Configuration parameters match YOLOv8 specification', () {
      expect(TFLiteService.inputSize, equals(640));
      expect(TFLiteService.defaultConfidenceThreshold, equals(0.40));
      expect(TFLiteService.defaultIouThreshold, equals(0.45));
      expect(TFLiteService.defaultClassNames, equals(targetClasses));
    });

    test('IoU calculation correctly evaluates overlapping boxes', () {
      // Identical boxes -> IoU = 1.0
      final boxA = const Rect.fromLTWH(0.1, 0.1, 0.4, 0.4);
      final boxB = const Rect.fromLTWH(0.1, 0.1, 0.4, 0.4);
      expect(TFLiteService.calculateIoU(boxA, boxB), closeTo(1.0, 0.001));

      // Completely disjoint boxes -> IoU = 0.0
      final boxC = const Rect.fromLTWH(0.6, 0.6, 0.3, 0.3);
      expect(TFLiteService.calculateIoU(boxA, boxC), equals(0.0));

      // 50% overlap
      final boxD = const Rect.fromLTWH(0.1, 0.1, 0.4, 0.2); // half height
      final iouD = TFLiteService.calculateIoU(boxA, boxD);
      expect(iouD, closeTo(0.5, 0.01));
    });

    test('NMS correctly suppresses overlapping detections with IoU >= 0.45', () {
      final detections = [
        DetectionResult(
          label: 'current_jal',
          confidence: 0.95,
          boundingBox: const Rect.fromLTWH(0.2, 0.2, 0.5, 0.5),
          classIndex: 2,
        ),
        // Overlapping duplicate with lower confidence (should be suppressed)
        DetectionResult(
          label: 'current_jal',
          confidence: 0.70,
          boundingBox: const Rect.fromLTWH(0.21, 0.21, 0.5, 0.5),
          classIndex: 2,
        ),
        // Low confidence detection below threshold (< 0.40)
        DetectionResult(
          label: 'chital_deer',
          confidence: 0.35,
          boundingBox: const Rect.fromLTWH(0.0, 0.0, 0.2, 0.2),
          classIndex: 1,
        ),
        // Distinct non-overlapping detection
        DetectionResult(
          label: 'bengal_tiger',
          confidence: 0.88,
          boundingBox: const Rect.fromLTWH(0.75, 0.75, 0.2, 0.2),
          classIndex: 0,
        ),
      ];

      final nmsResults = service.applyNms(
        detections,
        iouThreshold: 0.45,
        confThreshold: 0.40,
      );

      // Should keep: current_jal (0.95) and bengal_tiger (0.88)
      expect(nmsResults.length, equals(2));
      expect(nmsResults[0].label, equals('current_jal'));
      expect(nmsResults[0].confidence, equals(0.95));
      expect(nmsResults[1].label, equals('bengal_tiger'));
      expect(nmsResults[1].confidence, equals(0.88));
    });
  });

  group('Checklist 3: Decoupled Legal Lookup Pipeline', () {
    setUpAll(() async {
      await LegalRegistryService.initialize();
    });

    test('All 5 YOLOv8 classes match statutory laws in bangladesh_wildlife_laws.json', () {
      for (final cls in targetClasses) {
        final law = LegalRegistryService.lookup(cls);
        expect(law, isNotNull, reason: 'Class $cls must have matching WildlifeLaw entry');

        // Check required fields from Checklist 3
        expect(law!.commonName, isNotEmpty, reason: '$cls must have common_name');
        expect(law.scientificName, isNotEmpty, reason: '$cls must have scientific_name');
        expect(law.act, isNotEmpty, reason: '$cls must have act');
        expect(law.section, isNotEmpty, reason: '$cls must have section');
        expect(law.penaltySummary, isNotEmpty, reason: '$cls must have penalty_summary');
        expect(law.scheduleTier, isNotEmpty, reason: '$cls must have schedule_tier');
        expect(law.bailableStatus, isNotEmpty, reason: '$cls must have bailable status');
      }
    });

    test('Verify statutory details for current_jal (Banned Gear)', () {
      final law = LegalRegistryService.lookup('current_jal');
      expect(law, isNotNull);
      expect(law!.commonName, contains('কারেন্ট জাল'));
      expect(law.act, contains('মৎস্য'));
      expect(law.section, contains('ধারা ৪খ'));
      expect(law.penaltySummary, contains('কারাদণ্ড'));
      expect(law.isBannedGearOrPractice, isTrue);
      expect(law.scheduleTier, contains('মৎস্য সংরক্ষণ'));
    });

    test('Verify statutory details for bengal_tiger (Schedule-1 Non-Bailable)', () {
      final law = LegalRegistryService.lookup('bengal_tiger');
      expect(law, isNotNull);
      expect(law!.commonName, equals('রয়েল বেঙ্গল টাইগার'));
      expect(law.scientificName, equals('Panthera tigris'));
      expect(law.act, contains('বন্যপ্রাণী'));
      expect(law.section, contains('ধারা ৩৬'));
      expect(law.section, contains('তফসিল-১'));
      expect(law.penaltySummary, contains('২ থেকে ৭ বছর'));
      expect(law.isBailable, isFalse);
      expect(law.bailableStatus, contains('Non-Bailable'));
      expect(law.scheduleTier, contains('Schedule-I'));
    });

    test('Verify statutory details for ganges_dolphin (Critically Protected)', () {
      final law = LegalRegistryService.lookup('ganges_dolphin');
      expect(law, isNotNull);
      expect(law!.commonName, contains('ডলফিন'));
      expect(law.scientificName, equals('Platanista gangetica'));
      expect(law.act, contains('বন্যপ্রাণী'));
      expect(law.section, contains('ধারা ৩৭'));
      expect(law.isBailable, isFalse);
    });

    test('Verify statutory details for chital_deer and lesser_adjutant', () {
      final deer = LegalRegistryService.lookup('chital_deer');
      expect(deer, isNotNull);
      expect(deer!.scientificName, equals('Axis axis'));
      expect(deer.section, contains('তফসিল-১'));

      final stork = LegalRegistryService.lookup('lesser_adjutant');
      expect(stork, isNotNull);
      expect(stork!.scientificName, equals('Leptoptilos javanicus'));
      expect(stork.section, contains('ধারা ৩৮'));
    });
  });
}
