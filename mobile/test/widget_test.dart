import 'package:flutter_test/flutter_test.dart';
import 'package:sundarban_sentinel/models/incident_report.dart';
import 'package:sundarban_sentinel/models/risk_zone.dart';

void main() {
  test('IncidentReport serialization test', () {
    final report = IncidentReport(
      id: 'test_rep_1',
      lat: 21.87,
      lng: 89.75,
      label: 'Royal Bengal Tiger',
      confidence: 0.95,
      localImagePath: '/tmp/test.jpg',
      timestamp: DateTime.parse('2026-09-27T12:00:00Z'),
      deviceId: 'ranger_unit_01',
    );

    final map = report.toMap();
    expect(map['id'], 'test_rep_1');
    expect(map['label'], 'Royal Bengal Tiger');
    expect(map['confidence'], 0.95);

    final restored = IncidentReport.fromMap(map);
    expect(restored.id, report.id);
    expect(restored.label, report.label);
    expect(restored.lat, 21.87);
  });

  test('RiskZone GeoJSON parsing test', () {
    final geojson = {
      'id': 'sundarban_katka_01',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [89.72, 21.85],
            [89.78, 21.85],
            [89.79, 21.90],
            [89.72, 21.85]
          ]
        ]
      },
      'properties': {
        'zone_id': 'sundarban_katka_01',
        'name': 'Katka Wildlife Sanctuary',
        'status': 'ACTIVE_ANOMALY',
        'current_ndvi': 0.55,
        'historical_baseline_ndvi': 0.74,
        'ndvi_delta': -0.19,
        'surface_temp_c': 30.9
      }
    };

    final zone = RiskZone.fromGeoJson(geojson);
    expect(zone.id, 'sundarban_katka_01');
    expect(zone.isAnomaly, true);
    expect(zone.ndviDelta, -0.19);
    expect(zone.polygon.length, 4);
  });
}
