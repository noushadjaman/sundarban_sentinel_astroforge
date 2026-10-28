import 'package:latlong2/latlong.dart';

/// Represents a Starlink Satellite High-Performance Free Hotspot Terminal
/// deployed at remote, off-grid Sundarban forest patrol stations and fishing hubs.
class StarlinkNode {
  final String id;
  final String name;
  final String bengaliName;
  final String range;
  final LatLng location;
  final String noInternetZoneTitle;
  final String deadZoneReason;
  final List<LatLng> deadZonePolygon;
  final String routerSsid;
  final String routerModel;
  final double downlinkMbps;
  final double uplinkMbps;
  final int latencyMs;
  final int connectedClients;
  final double batteryPercentage;
  final String powerSource;
  final bool isOperational;

  const StarlinkNode({
    required this.id,
    required this.name,
    required this.bengaliName,
    required this.range,
    required this.location,
    required this.noInternetZoneTitle,
    required this.deadZoneReason,
    required this.deadZonePolygon,
    required this.routerSsid,
    this.routerModel = 'Starlink LEO High-Performance Gen 3',
    this.downlinkMbps = 185.0,
    this.uplinkMbps = 32.5,
    this.latencyMs = 29,
    this.connectedClients = 8,
    this.batteryPercentage = 98.0,
    this.powerSource = 'Solar Microgrid (10kWh LiFePO4)',
    this.isOperational = true,
  });
}
