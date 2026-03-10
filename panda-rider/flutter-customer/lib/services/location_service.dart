import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

class LocationService {
  static Future<bool> checkLocationPermission() async {
    final permission = await Geolocator.checkPermission();
    
    if (permission == LocationPermission.denied) {
      final result = await Geolocator.requestPermission();
      return result == LocationPermission.whileInUse ||
          result == LocationPermission.always;
    }
    
    if (permission == LocationPermission.deniedForever) {
      await Geolocator.openLocationSettings();
      return false;
    }
    
    return true;
  }

  static Future<Position?> getCurrentLocation() async {
    try {
      final hasPermission = await checkLocationPermission();
      
      if (!hasPermission) return null;

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      return position;
    } catch (e) {
      rethrow;
    }
  }

  static Future<String?> getAddressFromCoordinates(
    double latitude,
    double longitude,
  ) async {
    try {
      final placemarks = await placemarkFromCoordinates(latitude, longitude);
      
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        return '${place.street}, ${place.locality}, ${place.administrativeArea}';
      }
      
      return null;
    } catch (e) {
      rethrow;
    }
  }

  static Future<List<Location>> getCoordinatesFromAddress(String address) async {
    try {
      return await locationFromAddress(address);
    } catch (e) {
      rethrow;
    }
  }

  static Future<Stream<Position>> watchLocation() async {
    final hasPermission = await checkLocationPermission();
    
    if (!hasPermission) throw Exception('Location permission denied');

    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // Update every 10 meters
      ),
    );
  }

  static double calculateDistance(
    double startLatitude,
    double startLongitude,
    double endLatitude,
    double endLongitude,
  ) {
    return Geolocator.distanceBetween(
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
    );
  }
}
