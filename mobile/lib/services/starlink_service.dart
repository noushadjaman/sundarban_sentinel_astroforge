import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:latlong2/latlong.dart';
import '../models/starlink_node.dart';
import 'sync_service.dart';

/// Centralized Management & Mock Simulation Service for
/// Starlink Emergency Satellite Hotspots in Sundarban Cellular Dead Zones.
class StarlinkService {
  static final StarlinkService _instance = StarlinkService._internal();
  factory StarlinkService() => _instance;
  StarlinkService._internal();

  /// All 8 verified Starlink Free Hotspot Nodes in Sundarbans
  static final List<StarlinkNode> nodes = [
    // 1. Kotka Sanctuary Base
    StarlinkNode(
      id: 'sl_kotka_01',
      name: 'Kotka Wildlife Sanctuary Base',
      bengaliName: 'কটকা অভয়ারণ্য রেঞ্জার ক্যাম্প (নোড ০১)',
      range: 'Sharankhola Range / পূর্ব সুন্দরবন',
      location: const LatLng(21.8540, 89.7720),
      noInternetZoneTitle: 'Kotka-Jamtola Cellular Dead Zone',
      deadZoneReason: 'No commercial cellular towers; frequent local diesel generator outage.',
      routerSsid: 'Sundarban-Starlink-Free-Kotka',
      downlinkMbps: 194.0,
      uplinkMbps: 35.0,
      latencyMs: 27,
      connectedClients: 14,
      batteryPercentage: 96.0,
      powerSource: 'Solar Microgrid (12kWh LiFePO4)',
      deadZonePolygon: [
        const LatLng(21.825, 89.745),
        const LatLng(21.880, 89.745),
        const LatLng(21.885, 89.795),
        const LatLng(21.830, 89.800),
        const LatLng(21.825, 89.745),
      ],
    ),

    // 2. Kochikhali Tiger Point
    StarlinkNode(
      id: 'sl_kochikhali_02',
      name: 'Kochikhali Tiger Point Camp',
      bengaliName: 'কচিখালী টাইগার পয়েন্ট ক্যাম্প (নোড ০২)',
      range: 'Sharankhola Range / পূর্ব সুন্দরবন',
      location: const LatLng(21.8410, 89.7900),
      noInternetZoneTitle: 'Kochikhali Coastal Blackout Sector',
      deadZoneReason: 'Deep coastal mangrove mudflats; 0% cellular line-of-sight.',
      routerSsid: 'Sundarban-Starlink-Free-Kochikhali',
      downlinkMbps: 182.0,
      uplinkMbps: 29.5,
      latencyMs: 31,
      connectedClients: 9,
      batteryPercentage: 94.0,
      powerSource: 'Solar Photovoltaic + Wind Turbine Micro-hybrid',
      deadZonePolygon: [
        const LatLng(21.815, 89.770),
        const LatLng(21.865, 89.770),
        const LatLng(21.865, 89.825),
        const LatLng(21.815, 89.825),
        const LatLng(21.815, 89.770),
      ],
    ),

    // 3. Dublar Char (Alorkol)
    StarlinkNode(
      id: 'sl_dublar_03',
      name: 'Dublar Char (Alorkol) Fishermen Hub',
      bengaliName: 'দুবলার চর (আলোরকোল) মৎস্যজীবী নোড (০৩)',
      range: 'Southern Offshore Island / বঙ্গোপসাগর উপকূল',
      location: const LatLng(21.7230, 89.6030),
      noInternetZoneTitle: 'Dublar Char Offshore Isolation Zone',
      deadZoneReason: 'Seasonal island 45km offshore; 30,000+ fishermen cut off during storms.',
      routerSsid: 'Sundarban-Starlink-Free-DublarChar',
      downlinkMbps: 215.0,
      uplinkMbps: 38.0,
      latencyMs: 25,
      connectedClients: 42,
      batteryPercentage: 99.0,
      powerSource: 'High-Capacity Marine Solar Grid',
      deadZonePolygon: [
        const LatLng(21.685, 89.565),
        const LatLng(21.755, 89.565),
        const LatLng(21.760, 89.645),
        const LatLng(21.690, 89.645),
        const LatLng(21.685, 89.565),
      ],
    ),

    // 4. Hiron Point / Nilkamal Sanctuary
    StarlinkNode(
      id: 'sl_hiron_04',
      name: 'Hiron Point / Nilkamal Sanctuary Post',
      bengaliName: 'হিরণ পয়েন্ট / নীলকমল অভয়ারণ্য ফাঁড়ি (নোড ০৪)',
      range: 'Khulna Range / খুলনা বিভাগীয় রেঞ্জ',
      location: const LatLng(21.7970, 89.4730),
      noInternetZoneTitle: 'Nilkamal Estuary Dead Zone',
      deadZoneReason: 'Passur river mouth boundary; only intermittent VHF radio accessible.',
      routerSsid: 'Sundarban-Starlink-Free-HironPoint',
      downlinkMbps: 178.0,
      uplinkMbps: 31.0,
      latencyMs: 33,
      connectedClients: 11,
      batteryPercentage: 92.0,
      powerSource: 'Solar Array + Tidal Backup Storage',
      deadZonePolygon: [
        const LatLng(21.760, 89.435),
        const LatLng(21.830, 89.435),
        const LatLng(21.835, 89.510),
        const LatLng(21.765, 89.510),
        const LatLng(21.760, 89.435),
      ],
    ),

    // 5. Mandarbaria Beach
    StarlinkNode(
      id: 'sl_mandarbaria_05',
      name: 'Mandarbaria Coastal Frontier Outpost',
      bengaliName: 'মান্দারবাড়িয়া সৈকত সীমান্ত ফাঁড়ি (নোড ০৫)',
      range: 'Satkhira Range / পশ্চিম সুন্দরবন',
      location: const LatLng(21.7412, 89.0928),
      noInternetZoneTitle: 'Mandarbaria Border Dead Zone',
      deadZoneReason: 'Extreme southwestern maritime boundary; zero national cellular footprint.',
      routerSsid: 'Sundarban-Starlink-Free-Mandarbaria',
      downlinkMbps: 188.0,
      uplinkMbps: 33.0,
      latencyMs: 28,
      connectedClients: 7,
      batteryPercentage: 97.0,
      powerSource: 'Eco-Solar Ground Array',
      deadZonePolygon: [
        const LatLng(21.710, 89.055),
        const LatLng(21.775, 89.055),
        const LatLng(21.775, 89.130),
        const LatLng(21.710, 89.130),
        const LatLng(21.710, 89.055),
      ],
    ),

    // 6. Pushpakati Patrol Camp
    StarlinkNode(
      id: 'sl_pushpakati_06',
      name: 'Pushpakati Forest Patrol Outpost',
      bengaliName: 'পুষ্পকাটি বন টহল ফাঁড়ি (নোড ০৬)',
      range: 'Satkhira Range / পশ্চিম সুন্দরবন',
      location: const LatLng(21.9500, 89.1500),
      noInternetZoneTitle: 'Pushpakati Sanctuary Blind Spot',
      deadZoneReason: 'Protected wildlife sanctuary; total commercial tower ban under UNESCO rules.',
      routerSsid: 'Sundarban-Starlink-Free-Pushpakati',
      downlinkMbps: 175.0,
      uplinkMbps: 28.0,
      latencyMs: 34,
      connectedClients: 6,
      batteryPercentage: 91.0,
      powerSource: 'Canopy Solar Tracker 8kWh',
      deadZonePolygon: [
        const LatLng(21.915, 89.115),
        const LatLng(21.985, 89.115),
        const LatLng(21.985, 89.185),
        const LatLng(21.915, 89.185),
        const LatLng(21.915, 89.115),
      ],
    ),

    // 7. Notabeki Core Tiger Territory
    StarlinkNode(
      id: 'sl_notabeki_07',
      name: 'Notabeki Core Tiger Outpost',
      bengaliName: 'নোটাবেকী বাঘ অভয়ারণ্য ক্যাম্প (নোড ০৭)',
      range: 'Satkhira Range / পশ্চিম সুন্দরবন',
      location: const LatLng(22.0500, 89.1800),
      noInternetZoneTitle: 'Notabeki Deep Wilderness Shadow Zone',
      deadZoneReason: 'High tiger-density core preserve; completely isolated forest interior.',
      routerSsid: 'Sundarban-Starlink-Free-Notabeki',
      downlinkMbps: 191.0,
      uplinkMbps: 34.0,
      latencyMs: 29,
      connectedClients: 5,
      batteryPercentage: 95.0,
      powerSource: 'Solar Mast System',
      deadZonePolygon: [
        const LatLng(22.015, 89.145),
        const LatLng(22.085, 89.145),
        const LatLng(22.085, 89.215),
        const LatLng(22.015, 89.215),
        const LatLng(22.015, 89.145),
      ],
    ),

    // 8. Supati River Patrol Post
    StarlinkNode(
      id: 'sl_supati_08',
      name: 'Supati River Barrier Patrol Post',
      bengaliName: 'সুপতি নদী টহল ফাঁড়ি (নোড ০৮)',
      range: 'Sharankhola Range / পূর্ব সুন্দরবন',
      location: const LatLng(22.0400, 89.8400),
      noInternetZoneTitle: 'Supati-Baleshwar Estuarine Blind Spot',
      deadZoneReason: 'Estuarine anti-poaching river barrier station; extreme signal attenuation.',
      routerSsid: 'Sundarban-Starlink-Free-Supati',
      downlinkMbps: 180.0,
      uplinkMbps: 30.0,
      latencyMs: 32,
      connectedClients: 8,
      batteryPercentage: 93.0,
      powerSource: 'Solar Marine Pontoon Rig',
      deadZonePolygon: [
        const LatLng(22.005, 89.805),
        const LatLng(22.075, 89.805),
        const LatLng(22.075, 89.875),
        const LatLng(22.005, 89.875),
        const LatLng(22.005, 89.805),
      ],
    ),
  ];

  // Active Connection State Notifiers
  final ValueNotifier<StarlinkNode?> connectedNodeNotifier = ValueNotifier<StarlinkNode?>(null);
  final ValueNotifier<bool> isConnectingNotifier = ValueNotifier<bool>(false);
  final ValueNotifier<String> connectionStepNotifier = ValueNotifier<String>('');
  final ValueNotifier<String?> assignedIpNotifier = ValueNotifier<String?>(null);

  bool get isConnected => connectedNodeNotifier.value != null;
  StarlinkNode? get connectedNode => connectedNodeNotifier.value;

  /// Simulates connecting to a Starlink router with step-by-step telemetry
  Future<bool> connectToNode(StarlinkNode node, {SyncService? syncService}) async {
    if (connectedNodeNotifier.value?.id == node.id) {
      return true; // Already connected
    }

    isConnectingNotifier.value = true;

    // Step 1: Scanning RF beacon
    connectionStepNotifier.value = 'Scanning 5.8 GHz Beacon: ${node.routerSsid}...';
    await Future.delayed(const Duration(milliseconds: 450));

    // Step 2: Locking Starlink LEO satellite beam
    connectionStepNotifier.value = 'Locking Starlink LEO Satellite Constellation (Beam #104)...';
    await Future.delayed(const Duration(milliseconds: 550));

    // Step 3: WPA3 handshake & Captive free community access
    connectionStepNotifier.value = 'Negotiating WPA3 Free Emergency Community Handshake...';
    await Future.delayed(const Duration(milliseconds: 400));

    // Step 4: DHCP IP Allocation
    final ipLastOctet = Random().nextInt(140) + 15;
    final ip = '192.168.100.$ipLastOctet';
    assignedIpNotifier.value = ip;
    connectionStepNotifier.value = 'DHCP Gateway Assigned: $ip • Ping ${node.latencyMs}ms';
    await Future.delayed(const Duration(milliseconds: 350));

    // Connection established!
    connectedNodeNotifier.value = node;
    isConnectingNotifier.value = false;
    connectionStepNotifier.value = 'Connected to ${node.name} (${node.downlinkMbps} Mbps Free)';

    // Directly integrate with SyncService: turn online & sync offline buffer!
    if (syncService != null) {
      syncService.isOnlineNotifier.value = true;
      syncService.syncPendingReports();
    }

    return true;
  }

  /// Disconnects from current Starlink router
  void disconnect({SyncService? syncService}) {
    connectedNodeNotifier.value = null;
    assignedIpNotifier.value = null;
    connectionStepNotifier.value = 'Disconnected from Starlink';
  }

  /// Calculates geodesic distance in kilometers between two points
  double distanceKm(LatLng p1, LatLng p2) {
    const d = Distance();
    return d.as(LengthUnit.Kilometer, p1, p2);
  }

  /// Finds nearest Starlink node from given position
  StarlinkNode getNearestNode(LatLng pos) {
    StarlinkNode nearest = nodes.first;
    double minD = double.infinity;
    for (final n in nodes) {
      final dist = distanceKm(pos, n.location);
      if (dist < minD) {
        minD = dist;
        nearest = n;
      }
    }
    return nearest;
  }
}
