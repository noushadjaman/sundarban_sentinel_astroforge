import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/risk_zone.dart';
import '../models/incident_report.dart';

class ApiService {
  final String baseUrl;

  ApiService({
    this.baseUrl = 'https://sundarban-sentinel-gateway.sundarban-sentinel.workers.dev',
  });

  /// Fetches real-time active satellite anomaly polygons from Cloudflare Worker gateway
  Future<List<RiskZone>> getActiveRiskZones() async {
    final uri = Uri.parse('$baseUrl/api/v1/zones/active');
    try {
      final resp = await http.get(uri).timeout(const Duration(seconds: 15));
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        final features = data['features'] as List<dynamic>? ?? [];
        return features.map((f) => RiskZone.fromGeoJson(f as Map<String, dynamic>)).toList();
      } else {
        throw Exception('Worker returned ${resp.statusCode}: ${resp.body}');
      }
    } catch (e) {
      // ignore: avoid_print
      print('ApiService.getActiveRiskZones error: $e');
      rethrow;
    }
  }

  /// Commits edge incident report to Cloudflare Worker -> Firestore
  Future<Map<String, dynamic>> postFieldReport(IncidentReport report) async {
    final uri = Uri.parse('$baseUrl/api/v1/reports/ingest');
    final payload = {
      'lat': report.lat,
      'lng': report.lng,
      'label': report.label,
      'confidence': report.confidence,
      'cloudinary_url': report.cloudinaryUrl,
      'timestamp': report.timestamp.toIso8601String(),
      'device_id': report.deviceId,
      'notes': report.notes,
      'reporter_name': report.reporterName,
      'reporter_phone': report.reporterPhone,
      'reward_amount_bdt': report.rewardAmountBdt,
      'reward_status': report.rewardStatus,
    };

    final resp = await http
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(payload),
        )
        .timeout(const Duration(seconds: 20));

    if (resp.statusCode == 200 || resp.statusCode == 201) {
      return jsonDecode(resp.body) as Map<String, dynamic>;
    } else {
      throw Exception('Gateway ingest rejected with code ${resp.statusCode}: ${resp.body}');
    }
  }

  /// Verifies gateway connectivity
  Future<bool> checkGatewayHealth() async {
    try {
      final uri = Uri.parse('$baseUrl/api/v1/health');
      final resp = await http.get(uri).timeout(const Duration(seconds: 5));
      return resp.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
