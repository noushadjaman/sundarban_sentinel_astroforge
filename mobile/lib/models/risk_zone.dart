import 'package:latlong2/latlong.dart';

class RiskZone {
  final String id;
  final String name;
  final String description;
  final LatLng center;
  final List<LatLng> polygon;
  final String status;
  final String riskLevel;
  final bool isAnomaly;
  final double currentNdvi;
  final double baselineNdvi;
  final double ndviDelta;
  final double surfaceTempC;
  final double cloudCover;
  final String granuleId;
  final String sensorProduct;
  final String temperatureGranuleId;
  final String temperatureProduct;
  final String acquisitionStart;
  final String acquisitionEnd;
  final DateTime ingestionTimestamp;

  RiskZone({
    required this.id,
    required this.name,
    required this.description,
    required this.center,
    required this.polygon,
    required this.status,
    required this.riskLevel,
    required this.isAnomaly,
    required this.currentNdvi,
    required this.baselineNdvi,
    required this.ndviDelta,
    required this.surfaceTempC,
    required this.cloudCover,
    required this.granuleId,
    required this.sensorProduct,
    required this.temperatureGranuleId,
    required this.temperatureProduct,
    required this.acquisitionStart,
    required this.acquisitionEnd,
    required this.ingestionTimestamp,
  });

  factory RiskZone.fromGeoJson(Map<String, dynamic> json) {
    final props = json['properties'] as Map<String, dynamic>? ?? {};
    final geom = json['geometry'] as Map<String, dynamic>? ?? {};
    final id = json['id']?.toString() ?? props['zone_id']?.toString() ?? 'zone_unknown';

    // Parse center
    LatLng centerPt = const LatLng(21.87, 89.75);
    if (props['center'] is List && (props['center'] as List).length >= 2) {
      final cList = props['center'] as List;
      centerPt = LatLng(
        (cList[1] as num).toDouble(),
        (cList[0] as num).toDouble(),
      );
    }

    // Parse Polygon coordinates
    final List<LatLng> polyPts = [];
    if (geom['coordinates'] is List) {
      final rawCoords = geom['coordinates'] as List;
      final ring = (rawCoords.isNotEmpty && rawCoords[0] is List) ? rawCoords[0] as List : rawCoords;
      for (final pt in ring) {
        if (pt is List && pt.length >= 2) {
          final lng = (pt[0] as num).toDouble();
          final lat = (pt[1] as num).toDouble();
          polyPts.add(LatLng(lat, lng));
        }
      }
    }

    // Default polygon if none provided
    if (polyPts.isEmpty) {
      polyPts.addAll([
        LatLng(centerPt.latitude - 0.02, centerPt.longitude - 0.02),
        LatLng(centerPt.latitude - 0.02, centerPt.longitude + 0.02),
        LatLng(centerPt.latitude + 0.02, centerPt.longitude + 0.02),
        LatLng(centerPt.latitude + 0.02, centerPt.longitude - 0.02),
        LatLng(centerPt.latitude - 0.02, centerPt.longitude - 0.02),
      ]);
    }

    return RiskZone(
      id: id,
      name: props['name']?.toString() ?? 'Sundarban Monitored Sector',
      description: props['description']?.toString() ?? '',
      center: centerPt,
      polygon: polyPts,
      status: props['status']?.toString() ?? 'ACTIVE_ANOMALY',
      riskLevel: props['risk_level']?.toString() ?? 'HIGH',
      isAnomaly: props['is_anomaly'] == true || props['status'] == 'ACTIVE_ANOMALY',
      currentNdvi: (props['current_ndvi'] as num?)?.toDouble() ?? 0.55,
      baselineNdvi: (props['historical_baseline_ndvi'] as num?)?.toDouble() ?? 0.70,
      ndviDelta: (props['ndvi_delta'] as num?)?.toDouble() ?? -0.15,
      surfaceTempC: (props['surface_temp_c'] as num?)?.toDouble() ?? 29.5,
      cloudCover: (props['cloud_cover_percent'] as num?)?.toDouble() ?? 21.0,
      granuleId: props['granule_id']?.toString() ?? 'MOD13Q1.A2026241.h26v06.061',
      sensorProduct: props['sensor_product']?.toString() ?? 'MOD13Q1.061',
      temperatureGranuleId: props['temperature_granule_id']?.toString() ?? 'MOD11A2.A2026257',
      temperatureProduct: props['temperature_product']?.toString() ?? 'MOD11A2.061',
      acquisitionStart: props['acquisition_start']?.toString() ?? '2026-08-29',
      acquisitionEnd: props['acquisition_end']?.toString() ?? '2026-09-13',
      ingestionTimestamp: DateTime.tryParse(props['ingestion_timestamp']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}
