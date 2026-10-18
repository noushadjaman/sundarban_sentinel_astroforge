import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

class LocationService {
  // Default coordinate in Katka Wildlife Sanctuary, Sundarbans
  static const LatLng defaultSundarbanLocation = LatLng(21.87, 89.75);

  StreamSubscription<Position>? _positionSub;

  Future<LatLng> getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return defaultSundarbanLocation;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return defaultSundarbanLocation;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return defaultSundarbanLocation;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 8),
        ),
      );

      return LatLng(position.latitude, position.longitude);
    } catch (_) {
      return defaultSundarbanLocation;
    }
  }

  Stream<LatLng> get locationStream {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5,
      ),
    ).map((pos) => LatLng(pos.latitude, pos.longitude)).handleError((_) => defaultSundarbanLocation);
  }

  void dispose() {
    _positionSub?.cancel();
  }
}
