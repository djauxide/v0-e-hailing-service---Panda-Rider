import 'package:flutter/material.dart';

class AppConstants {
  // API
  static const String apiBaseUrl = String.fromEnvironment(
    'BACKEND_API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );
  static const String socketUrl = String.fromEnvironment(
    'SOCKET_IO_URL',
    defaultValue: 'http://localhost:3000',
  );

  // Google Maps
  static const String googleMapsApiKey = String.fromEnvironment(
    'GOOGLE_MAPS_API_KEY',
    defaultValue: '',
  );

  // Stripe
  static const String stripePublishableKey = String.fromEnvironment(
    'STRIPE_PUBLISHABLE_KEY',
    defaultValue: '',
  );

  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration locationUpdateInterval = Duration(seconds: 5);

  // Defaults
  static const double defaultMapZoom = 15.0;
  static const double searchRadiusMeters = 10000; // 10 km

  // Service Types
  static const List<String> serviceTypes = [
    'ride',
    'delivery',
    'courier',
  ];

  // Trip Status
  static const String tripStatusRequesting = 'requesting';
  static const String tripStatusAccepted = 'accepted';
  static const String tripStatusArriving = 'arriving';
  static const String tripStatusInProgress = 'in_progress';
  static const String tripStatusCompleted = 'completed';
  static const String tripStatusCancelled = 'cancelled';

  // Payment Status
  static const String paymentStatusPending = 'pending';
  static const String paymentStatusCompleted = 'completed';
  static const String paymentStatusFailed = 'failed';
  static const String paymentStatusRefunded = 'refunded';
}
