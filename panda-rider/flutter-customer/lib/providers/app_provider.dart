import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';

class AppProvider extends ChangeNotifier {
  User? _currentUser;
  Trip? _currentTrip;
  bool _isLoading = false;
  String? _errorMessage;

  // Getters
  User? get currentUser => _currentUser;
  Trip? get currentTrip => _currentTrip;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Load user data
  Future<void> loadUserData(String userId) async {
    try {
      _isLoading = true;
      notifyListeners();

      final userDoc = await FirebaseService.getUserData(userId);
      _currentUser = User.fromMap(userDoc.data() as Map<String, dynamic>);
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update current trip
  void setCurrentTrip(Trip? trip) {
    _currentTrip = trip;
    notifyListeners();
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Reset provider
  void reset() {
    _currentUser = null;
    _currentTrip = null;
    _isLoading = false;
    _errorMessage = null;
    notifyListeners();
  }
}
