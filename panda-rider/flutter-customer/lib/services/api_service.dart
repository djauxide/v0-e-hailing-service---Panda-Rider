import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';

class ApiService {
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: AppConstants.apiTimeout,
      receiveTimeout: AppConstants.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    ),
  );

  ApiService() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: _onRequest,
        onError: _onError,
      ),
    );
  }

  Future<void> _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('authToken');
    
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    return handler.next(options);
  }

  Future<void> _onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('authToken');
    }
    return handler.next(err);
  }

  // Auth endpoints
  Future<Response> login(String email, String password) async {
    return _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> signup(String email, String password, String name, String phone) async {
    return _dio.post('/auth/signup', data: {
      'email': email,
      'password': password,
      'name': name,
      'phone': phone,
      'userType': 'customer',
    });
  }

  Future<Response> getProfile() async {
    return _dio.get('/auth/profile');
  }

  // Trip endpoints
  Future<Response> requestTrip(Map<String, dynamic> tripData) async {
    return _dio.post('/trips', data: tripData);
  }

  Future<Response> getTripDetails(String tripId) async {
    return _dio.get('/trips/$tripId');
  }

  Future<Response> getUserTrips() async {
    return _dio.get('/trips');
  }

  Future<Response> cancelTrip(String tripId) async {
    return _dio.post('/trips/$tripId/cancel');
  }

  // Driver endpoints
  Future<Response> searchNearbyDrivers(double latitude, double longitude) async {
    return _dio.get(
      '/drivers/nearby',
      queryParameters: {
        'latitude': latitude,
        'longitude': longitude,
      },
    );
  }

  // Payment endpoints
  Future<Response> createPaymentIntent(String tripId, double amount) async {
    return _dio.post('/payments/intent', data: {
      'tripId': tripId,
      'amount': amount,
    });
  }

  Future<Response> confirmPayment(String tripId, String paymentMethodId) async {
    return _dio.post('/payments/confirm', data: {
      'tripId': tripId,
      'paymentMethodId': paymentMethodId,
    });
  }

  // Rating endpoints
  Future<Response> submitRating(String tripId, double rating, String review) async {
    return _dio.post('/ratings', data: {
      'tripId': tripId,
      'rating': rating,
      'review': review,
    });
  }

  // Chat endpoints
  Future<Response> getMessages(String tripId) async {
    return _dio.get('/chats/$tripId/messages');
  }

  Future<Response> sendMessage(String tripId, String message) async {
    return _dio.post('/chats/$tripId/messages', data: {
      'message': message,
    });
  }
}
