import 'package:flutter/material.dart';
import '../services/firebase_service.dart';
import '../models/driver_models.dart';

class DriverProvider extends ChangeNotifier {
  Driver? _currentDriver;
  List<Trip> _availableTrips = [];
  Trip? _currentTrip;
  bool _isOnline = false;
  bool _isLoading = false;
  String? _errorMessage;

  Driver? get currentDriver => _currentDriver;
  List<Trip> get availableTrips => _availableTrips;
  Trip? get currentTrip => _currentTrip;
  bool get isOnline => _isOnline;
  bool get isLoading => _isLoading;

  Future<void> loadDriverData(String driverId) async {
    try {
      _isLoading = true;
      notifyListeners();
      final driverDoc = await FirebaseService.getDriver(driverId);
      _currentDriver = Driver.fromMap(driverDoc.data() as Map<String, dynamic>);
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleOnlineStatus() async {
    try {
      _isOnline = !_isOnline;
      if (_currentDriver != null) {
        await FirebaseService.updateDriver(_currentDriver!.id, {
          'isOnline': _isOnline,
        });
      }
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
    }
  }

  void setCurrentTrip(Trip? trip) {
    _currentTrip = trip;
    notifyListeners();
  }

  void reset() {
    _currentDriver = null;
    _availableTrips = [];
    _currentTrip = null;
    _isOnline = false;
    _isLoading = false;
    _errorMessage = null;
    notifyListeners();
  }
}
