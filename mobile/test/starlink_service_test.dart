import 'package:flutter_test/flutter_test.dart';
import 'package:latlong2/latlong.dart';
import 'package:sundarban_sentinel/services/starlink_service.dart';

void main() {
  group('StarlinkService & No-Internet Dead Zones Verification', () {
    final starlink = StarlinkService();

    test('All 8 Sundarban dead zones and Starlink nodes are registered', () {
      expect(StarlinkService.nodes.length, equals(8));

      final expectedNodeIds = [
        'sl_kotka_01',
        'sl_kochikhali_02',
        'sl_dublar_03',
        'sl_hiron_04',
        'sl_mandarbaria_05',
        'sl_pushpakati_06',
        'sl_notabeki_07',
        'sl_supati_08',
      ];

      for (final id in expectedNodeIds) {
        final node = StarlinkService.nodes.firstWhere((n) => n.id == id);
        expect(node.name, isNotEmpty);
        expect(node.bengaliName, isNotEmpty);
        expect(node.routerSsid, isNotEmpty);
        expect(node.noInternetZoneTitle, isNotEmpty);
        expect(node.deadZoneReason, isNotEmpty);
        expect(node.deadZonePolygon.length, greaterThanOrEqualTo(4));
        expect(node.downlinkMbps, greaterThan(100.0));
        expect(node.latencyMs, lessThan(40));
        expect(node.batteryPercentage, greaterThan(80.0));
      }
    });

    test('Nearest node calculation works accurately', () {
      // Near Kotka Sanctuary
      final kotkaPos = const LatLng(21.85, 89.77);
      final nearestKotka = starlink.getNearestNode(kotkaPos);
      expect(nearestKotka.id, equals('sl_kotka_01'));

      // Near Mandarbaria (West border)
      final mandarbariaPos = const LatLng(21.74, 89.09);
      final nearestMandarbaria = starlink.getNearestNode(mandarbariaPos);
      expect(nearestMandarbaria.id, equals('sl_mandarbaria_05'));

      // Distance calculation
      final dist = starlink.distanceKm(kotkaPos, nearestKotka.location);
      expect(dist, lessThan(2.0));
    });

    test('Mock connection workflow assigns IP and updates status', () async {
      final node = StarlinkService.nodes.first;
      starlink.disconnect();
      expect(starlink.isConnected, isFalse);
      expect(starlink.connectedNode, isNull);

      final success = await starlink.connectToNode(node);
      expect(success, isTrue);
      expect(starlink.isConnected, isTrue);
      expect(starlink.connectedNode?.id, equals(node.id));
      expect(starlink.assignedIpNotifier.value, contains('192.168.100.'));

      starlink.disconnect();
      expect(starlink.isConnected, isFalse);
      expect(starlink.connectedNode, isNull);
    });
  });
}
