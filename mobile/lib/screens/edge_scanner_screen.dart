import 'dart:math';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image/image.dart' as img;
import '../services/classifier_service.dart';
import '../services/sync_service.dart';
import '../services/location_service.dart';
import '../services/legal_registry_service.dart';
import '../models/wildlife_law.dart';

class EdgeScannerScreen extends StatefulWidget {
  final ClassifierService classifierService;
  final SyncService syncService;
  final LocationService locationService;

  const EdgeScannerScreen({
    super.key,
    required this.classifierService,
    required this.syncService,
    required this.locationService,
  });

  @override
  State<EdgeScannerScreen> createState() => _EdgeScannerScreenState();
}

class _EdgeScannerScreenState extends State<EdgeScannerScreen> {
  final ImagePicker _picker = ImagePicker();
  final TextEditingController _notesController = TextEditingController();

  Uint8List? _selectedImageBytes;
  bool _isProcessing = false;
  int _inferenceTimeMs = 0;
  List<DetectionResult> _detections = [];

  bool _isSaving = false;
  String? _statusBanner;

  @override
  void initState() {
    super.initState();
    // Warm up the Edge TFLite model and Legal Registry offline
    widget.classifierService.initialize();
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1280,
        maxHeight: 1280,
        imageQuality: 90,
      );

      if (file == null) return;

      final bytes = await file.readAsBytes();
      if (!mounted) return;
      setState(() {
        _selectedImageBytes = bytes;
        _detections.clear();
        _statusBanner = null;
      });

      await _runInference(bytes);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load image: $e')),
        );
      }
    }
  }

  /// Runs on-device offline TFLite edge inference
  Future<void> _runInference(Uint8List bytes) async {
    setState(() => _isProcessing = true);
    final stopwatch = Stopwatch()..start();

    try {
      final results = await widget.classifierService.detect(bytes);
      stopwatch.stop();

      if (!mounted) return;
      setState(() {
        _detections = results;
        _inferenceTimeMs = stopwatch.elapsedMilliseconds;
        _isProcessing = false;
      });
    } catch (e) {
      stopwatch.stop();
      if (!mounted) return;
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('On-device TFLite inference error: $e')),
      );
    }
  }

  /// Instant synthetic test generator for offline verification without physical camera
  void _loadSampleTarget(String labelName) {
    // Generate a clean test image with color profile
    final testImg = img.Image(width: 640, height: 640);
    img.fill(testImg, color: img.ColorRgb8(18, 38, 28));

    if (labelName == 'bengal_tiger') {
      img.fillRect(testImg, x1: 150, y1: 150, x2: 480, y2: 450, color: img.ColorRgb8(220, 110, 20));
    } else if (labelName == 'current_jal') {
      img.fillRect(testImg, x1: 100, y1: 180, x2: 540, y2: 420, color: img.ColorRgb8(240, 240, 240));
      img.fillRect(testImg, x1: 50, y1: 250, x2: 590, y2: 500, color: img.ColorRgb8(30, 80, 140));
    } else if (labelName == 'ganges_dolphin') {
      img.fillRect(testImg, x1: 120, y1: 200, x2: 520, y2: 460, color: img.ColorRgb8(40, 100, 160));
    } else if (labelName == 'chital_deer') {
      img.fillRect(testImg, x1: 140, y1: 160, x2: 500, y2: 480, color: img.ColorRgb8(140, 90, 40));
    } else {
      img.fillRect(testImg, x1: 180, y1: 140, x2: 460, y2: 490, color: img.ColorRgb8(90, 120, 90));
    }

    final jpgBytes = Uint8List.fromList(img.encodeJpg(testImg));

    setState(() {
      _selectedImageBytes = jpgBytes;
      _statusBanner = null;
    });

    _runInference(jpgBytes);
  }

  Future<void> _saveAndSync() async {
    if (_selectedImageBytes == null || _detections.isEmpty) return;

    setState(() => _isSaving = true);
    try {
      final location = await widget.locationService.getCurrentLocation();
      final topDetection = _detections.first;

      final report = await widget.syncService.saveReportLocally(
        lat: location.latitude,
        lng: location.longitude,
        label: topDetection.label,
        confidence: topDetection.confidence,
        imageBytes: _selectedImageBytes!,
        notes: _notesController.text.trim(),
      );

      if (!mounted) return;
      setState(() {
        _isSaving = false;
        _statusBanner = report.isSynced
            ? '✓ INCIDENT LOGGED & SYNCED TO FIRESTORE'
            : '✓ CACHED LOCALLY IN OFFLINE HIVE VAULT (PENDING SYNC)';
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF00E676),
          content: Text(
            report.isSynced
                ? 'Incident report synced to Ranger Central Cloud!'
                : 'Incident safely committed to on-device offline storage!',
            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.redAccent,
          content: Text('Failed to persist incident: $e'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final topDetection = _detections.isNotEmpty ? _detections.first : null;
    final topLaw = topDetection != null ? LegalRegistryService.lookup(topDetection.label) : null;

    return Scaffold(
      backgroundColor: const Color(0xFF07110C),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0C1F16),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.radar, color: Color(0xFF00E676), size: 20),
                SizedBox(width: 8),
                Text(
                  'EDGE AI SENTINEL',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: Color(0xFF00E676),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                const Text(
                  '100% OFFLINE EDGE MODE • INT8 YOLOv8',
                  style: TextStyle(
                    fontSize: 9,
                    letterSpacing: 0.8,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF00E676),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.photo_library, color: Color(0xFF00E5FF)),
            onPressed: () => _pickImage(ImageSource.gallery),
            tooltip: 'Gallery',
          ),
          IconButton(
            icon: const Icon(Icons.camera_alt, color: Color(0xFF00E676)),
            onPressed: () => _pickImage(ImageSource.camera),
            tooltip: 'Camera',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status banner if saved
            if (_statusBanner != null)
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF00E676).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF00E676)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.verified, size: 18, color: Color(0xFF00E676)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _statusBanner!,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF00E676),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            // Live Camera Viewfinder / Detection Overlay Container
            Container(
              height: 340,
              decoration: BoxDecoration(
                color: const Color(0xFF0F2218),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _detections.isNotEmpty
                      ? (_detections.first.isHighRisk
                          ? const Color(0xFFFF1744)
                          : const Color(0xFF00E676))
                      : Colors.white12,
                  width: 2.0,
                ),
                boxShadow: [
                  if (_detections.isNotEmpty)
                    BoxShadow(
                      color: (_detections.first.isHighRisk
                              ? const Color(0xFFFF1744)
                              : const Color(0xFF00E676))
                          .withValues(alpha: 0.25),
                      blurRadius: 18,
                      spreadRadius: 2,
                    ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(15),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (_selectedImageBytes != null)
                      Image.memory(
                        _selectedImageBytes!,
                        fit: BoxFit.cover,
                      )
                    else
                      Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFF00E676).withValues(alpha: 0.1),
                                border: Border.all(color: const Color(0xFF00E676).withValues(alpha: 0.3)),
                              ),
                              child: const Icon(
                                Icons.center_focus_weak,
                                size: 48,
                                color: Color(0xFF00E676),
                              ),
                            ),
                            const SizedBox(height: 14),
                            const Text(
                              'LIVE CAMERA VIEWFINDER READY',
                              style: TextStyle(
                                fontSize: 13,
                                letterSpacing: 1.2,
                                fontWeight: FontWeight.bold,
                                color: Colors.white70,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Capture live feed or pick photo to trigger INT8 edge detection',
                              style: TextStyle(fontSize: 11, color: Colors.white38),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                ElevatedButton.icon(
                                  onPressed: () => _pickImage(ImageSource.camera),
                                  icon: const Icon(Icons.camera_alt, size: 16, color: Colors.black),
                                  label: const Text(
                                    'OPEN CAMERA',
                                    style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF00E676),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                OutlinedButton.icon(
                                  onPressed: () => _pickImage(ImageSource.gallery),
                                  icon: const Icon(Icons.photo_library, size: 16, color: Color(0xFF00E5FF)),
                                  label: const Text(
                                    'GALLERY',
                                    style: TextStyle(color: Color(0xFF00E5FF), fontWeight: FontWeight.bold),
                                  ),
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: Color(0xFF00E5FF)),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                    // High-Visibility Tactical Bounding Box Overlay
                    if (_selectedImageBytes != null && _detections.isNotEmpty)
                      CustomPaint(
                        painter: HighVisibilityBoundingBoxPainter(detections: _detections),
                      ),

                    // HUD Top Overlay Badge (Latency & Confidence)
                    if (_selectedImageBytes != null)
                      Positioned(
                        top: 10,
                        left: 10,
                        right: 10,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.75),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: Colors.white24),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.speed, size: 13, color: Color(0xFF00E5FF)),
                                  const SizedBox(width: 5),
                                  Text(
                                    'INFERENCE: ${_inferenceTimeMs}ms (640x640 INT8)',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF00E5FF),
                                      letterSpacing: 0.6,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.75),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: _detections.isNotEmpty
                                      ? (_detections.first.isHighRisk
                                          ? const Color(0xFFFF1744)
                                          : const Color(0xFF00E676))
                                      : Colors.white24,
                                ),
                              ),
                              child: Text(
                                _detections.isNotEmpty
                                    ? '${_detections.length} DETECTED'
                                    : 'SCANNING...',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: _detections.isNotEmpty
                                      ? (_detections.first.isHighRisk
                                          ? const Color(0xFFFF1744)
                                          : const Color(0xFF00E676))
                                      : Colors.white70,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    if (_isProcessing)
                      Container(
                        color: Colors.black.withValues(alpha: 0.75),
                        child: const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(
                                color: Color(0xFF00E676),
                                strokeWidth: 3,
                              ),
                              SizedBox(height: 14),
                              Text(
                                'RUNNING INT8 YOLOv8 TFLITE ENGINE...',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.1,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Input: [1, 640, 640, 3] • NMS: IoU ≥ 0.45',
                                style: TextStyle(fontSize: 10, color: Colors.white54),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Quick Test Buttons (1-click testing for all 5 trained classes)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF0B1B13),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF163725)),
              ),
              child: Row(
                children: [
                  const Text(
                    'TEST:',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.white54,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildQuickTestChip('🐅 Tiger', 'bengal_tiger', const Color(0xFFFF9100)),
                          _buildQuickTestChip('🕸️ Current Jal', 'current_jal', const Color(0xFFFF1744)),
                          _buildQuickTestChip('🐬 Dolphin', 'ganges_dolphin', const Color(0xFF00E5FF)),
                          _buildQuickTestChip('🦌 Deer', 'chital_deer', const Color(0xFF00E676)),
                          _buildQuickTestChip('🦩 Adjutant', 'lesser_adjutant', const Color(0xFF76FF03)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // High-Visibility Statutory Legal Alert Card
            if (topDetection != null && topLaw != null)
              _buildStatutoryAlertCard(topDetection, topLaw),

            // Ranger Notes Input
            TextField(
              controller: _notesController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Ranger Field Log / Creek Coordinates & Sector',
                labelStyle: const TextStyle(color: Colors.white54, fontSize: 12),
                hintText: 'e.g. Current jal seized across Shekhertek canal mouth',
                hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF0F2218),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF1B3B2B)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF1B3B2B)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF00E676)),
                ),
              ),
            ),

            const SizedBox(height: 18),

            // Offline Commit & Auto-Sync Button
            SizedBox(
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : _saveAndSync,
                icon: _isSaving
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : const Icon(Icons.save_alt, color: Colors.black),
                label: Text(
                  _isSaving
                      ? 'CACHING OFFLINE TO HIVE...'
                      : 'LOG INCIDENT TO LOCAL HIVE VAULT',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: Colors.black,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00E676),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickTestChip(String title, String labelKey, Color color) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: InkWell(
        onTap: () => _loadSampleTarget(labelKey),
        borderRadius: BorderRadius.circular(6),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: color.withValues(alpha: 0.5)),
          ),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ),
      ),
    );
  }

  /// High-Visibility Bottom Alert Card summarizing Statutory Violations & Penalties
  Widget _buildStatutoryAlertCard(DetectionResult detection, WildlifeLaw law) {
    final isSevere = law.isBannedGearOrPractice || law.isStrictlyProhibited;
    final alertColor = isSevere ? const Color(0xFFFF1744) : const Color(0xFF00E676);
    final headerTitle = law.isBannedGearOrPractice
        ? '🚨 CRITICAL LEGAL VIOLATION DETECTED'
        : (law.isStrictlyProhibited
            ? '🛡️ CRITICALLY PROTECTED WILDLIFE'
            : '🌿 STATUTORY PROTECTED FAUNA');

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1E16),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: alertColor, width: 1.8),
        boxShadow: [
          BoxShadow(
            color: alertColor.withValues(alpha: 0.2),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Alert Header Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: alertColor.withValues(alpha: 0.18),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
              border: Border(bottom: BorderSide(color: alertColor.withValues(alpha: 0.4))),
            ),
            child: Row(
              children: [
                Icon(
                  isSevere ? Icons.warning_amber_rounded : Icons.shield,
                  color: alertColor,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    headerTitle,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                      color: alertColor,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: alertColor),
                  ),
                  child: Text(
                    detection.formattedConfidence,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      color: alertColor,
                    ),
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Common Name & Scientific Name
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      law.commonName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '(${law.scientificName})',
                        style: const TextStyle(
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                          color: Colors.white60,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // 2. Act & Section
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.gavel, size: 15, color: Color(0xFF00E5FF)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              law.act,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF00E5FF),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Padding(
                        padding: const EdgeInsets.only(left: 21),
                        child: Text(
                          'প্রযোজ্য ধারা: ${law.section}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF81D4FA),
                          ),
                        ),
                      ),
                      const Divider(color: Colors.white12, height: 16),

                      // 3. Penalty Summary
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'দণ্ড ও সাজা: ',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFFF5252),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              law.penaltySummary,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.white70,
                                height: 1.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // 4. Bailable Status & Schedule Tier Badges
                Row(
                  children: [
                    // Bailable Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: law.isBailable
                            ? const Color(0xFFFFAB00).withValues(alpha: 0.2)
                            : const Color(0xFFFF1744).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: law.isBailable ? const Color(0xFFFFAB00) : const Color(0xFFFF1744),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            law.isBailable ? Icons.lock_open : Icons.lock,
                            size: 13,
                            color: law.isBailable ? const Color(0xFFFFAB00) : const Color(0xFFFF1744),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            law.bailableStatus,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: law.isBailable ? const Color(0xFFFFAB00) : const Color(0xFFFF1744),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Schedule Tier Badge
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00E5FF).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.6)),
                        ),
                        child: Text(
                          law.scheduleTier,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF80D8FF),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // 5. Ranger Action Instruction Directive
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00E676).withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF00E676).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.security, size: 16, color: Color(0xFF00E676)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'রেঞ্জার করণীয়: ${law.actionInstruction}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFB9F6CA),
                            height: 1.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// High-visibility tactical bounding box painter with HUD corner brackets and color coding
class HighVisibilityBoundingBoxPainter extends CustomPainter {
  final List<DetectionResult> detections;

  HighVisibilityBoundingBoxPainter({required this.detections});

  Color _getColorForClass(String label) {
    final norm = label.toLowerCase();
    if (norm.contains('jal') || norm.contains('net') || norm.contains('gear') || norm.contains('poach')) {
      return const Color(0xFFFF1744); // Crimson warning
    }
    if (norm.contains('tiger')) {
      return const Color(0xFFFF9100); // Amber tiger
    }
    if (norm.contains('dolphin')) {
      return const Color(0xFF00E5FF); // Electric cyan
    }
    if (norm.contains('deer')) {
      return const Color(0xFF00E676); // High-vis emerald
    }
    if (norm.contains('adjutant')) {
      return const Color(0xFF76FF03); // Lime forest
    }
    return const Color(0xFF00E676);
  }

  @override
  void paint(Canvas canvas, Size size) {
    for (final det in detections) {
      final box = det.boundingBox;
      final color = _getColorForClass(det.label);

      final left = (box.left * size.width).clamp(0.0, size.width);
      final top = (box.top * size.height).clamp(0.0, size.height);
      final width = (box.width * size.width).clamp(10.0, size.width - left);
      final height = (box.height * size.height).clamp(10.0, size.height - top);

      final rect = Rect.fromLTWH(left, top, width, height);

      // 1. Translucent Fill
      final fillPaint = Paint()
        ..color = color.withValues(alpha: 0.12)
        ..style = PaintingStyle.fill;
      canvas.drawRect(rect, fillPaint);

      // 2. Main High-Visibility Border
      final borderPaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;
      canvas.drawRect(rect, borderPaint);

      // 3. Tactical HUD Corner Brackets
      final bracketLen = min(20.0, min(rect.width, rect.height) * 0.28);
      final cornerPaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.8
        ..strokeCap = StrokeCap.square;

      // Top-Left
      canvas.drawLine(Offset(rect.left, rect.top + bracketLen), Offset(rect.left, rect.top), cornerPaint);
      canvas.drawLine(Offset(rect.left, rect.top), Offset(rect.left + bracketLen, rect.top), cornerPaint);

      // Top-Right
      canvas.drawLine(Offset(rect.right - bracketLen, rect.top), Offset(rect.right, rect.top), cornerPaint);
      canvas.drawLine(Offset(rect.right, rect.top), Offset(rect.right, rect.top + bracketLen), cornerPaint);

      // Bottom-Left
      canvas.drawLine(Offset(rect.left, rect.bottom - bracketLen), Offset(rect.left, rect.bottom), cornerPaint);
      canvas.drawLine(Offset(rect.left, rect.bottom), Offset(rect.left + bracketLen, rect.bottom), cornerPaint);

      // Bottom-Right
      canvas.drawLine(Offset(rect.right - bracketLen, rect.bottom), Offset(rect.right, rect.bottom), cornerPaint);
      canvas.drawLine(Offset(rect.right, rect.bottom), Offset(rect.right, rect.bottom - bracketLen), cornerPaint);

      // 4. Center Crosshair
      final crosshairPaint = Paint()
        ..color = color.withValues(alpha: 0.7)
        ..strokeWidth = 1.4;
      final c = rect.center;
      canvas.drawLine(Offset(c.dx - 8, c.dy), Offset(c.dx + 8, c.dy), crosshairPaint);
      canvas.drawLine(Offset(c.dx, c.dy - 8), Offset(c.dx, c.dy + 8), crosshairPaint);

      // 5. Header Label Badge
      final law = det.legalInfo;
      final displayTitle = law != null ? '${law.commonName} ${det.formattedConfidence}' : '${det.label} ${det.formattedConfidence}';

      final textSpan = TextSpan(
        text: displayTitle,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.4,
        ),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();

      final badgeRect = Rect.fromLTWH(
        rect.left,
        max(0.0, rect.top - 24),
        textPainter.width + 12,
        22,
      );

      final badgeBgPaint = Paint()
        ..color = Colors.black.withValues(alpha: 0.88)
        ..style = PaintingStyle.fill;
      final badgeBorderPaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2;

      final rrect = RRect.fromRectAndRadius(badgeRect, const Radius.circular(4));
      canvas.drawRRect(rrect, badgeBgPaint);
      canvas.drawRRect(rrect, badgeBorderPaint);

      textPainter.paint(canvas, Offset(badgeRect.left + 6, badgeRect.top + 4));
    }
  }

  @override
  bool shouldRepaint(covariant HighVisibilityBoundingBoxPainter oldDelegate) => true;
}
