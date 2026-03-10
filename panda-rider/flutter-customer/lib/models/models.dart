class User {
  final String id;
  final String email;
  final String name;
  final String phone;
  final String profileImage;
  final List<String> savedLocations;
  final double rating;
  final int totalRides;
  final bool isVerified;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.phone,
    required this.profileImage,
    this.savedLocations = const [],
    this.rating = 0,
    this.totalRides = 0,
    this.isVerified = false,
  });

  factory User.fromMap(Map<String, dynamic> data) {
    return User(
      id: data['id'] as String? ?? '',
      email: data['email'] as String? ?? '',
      name: data['name'] as String? ?? '',
      phone: data['phone'] as String? ?? '',
      profileImage: data['profileImage'] as String? ?? '',
      savedLocations: List<String>.from(data['savedLocations'] as List? ?? []),
      rating: (data['rating'] as num?)?.toDouble() ?? 0,
      totalRides: data['totalRides'] as int? ?? 0,
      isVerified: data['isVerified'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'profileImage': profileImage,
      'savedLocations': savedLocations,
      'rating': rating,
      'totalRides': totalRides,
      'isVerified': isVerified,
    };
  }
}

class LocationData {
  final double latitude;
  final double longitude;
  final String address;
  final String name;

  LocationData({
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.name,
  });

  factory LocationData.fromMap(Map<String, dynamic> data) {
    return LocationData(
      latitude: data['latitude'] as double? ?? 0,
      longitude: data['longitude'] as double? ?? 0,
      address: data['address'] as String? ?? '',
      name: data['name'] as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'name': name,
    };
  }
}

class Trip {
  final String id;
  final String userId;
  final String driverId;
  final String serviceType;
  final LocationData pickupLocation;
  final LocationData dropoffLocation;
  final String status;
  final DateTime createdAt;
  final DateTime? completedAt;
  final double fare;
  final double? distance;
  final int? duration;
  final String paymentMethod;
  final String paymentStatus;
  final double? rating;
  final String? review;

  Trip({
    required this.id,
    required this.userId,
    required this.driverId,
    required this.serviceType,
    required this.pickupLocation,
    required this.dropoffLocation,
    required this.status,
    required this.createdAt,
    this.completedAt,
    required this.fare,
    this.distance,
    this.duration,
    required this.paymentMethod,
    required this.paymentStatus,
    this.rating,
    this.review,
  });

  factory Trip.fromMap(Map<String, dynamic> data) {
    return Trip(
      id: data['id'] as String? ?? '',
      userId: data['userId'] as String? ?? '',
      driverId: data['driverId'] as String? ?? '',
      serviceType: data['serviceType'] as String? ?? '',
      pickupLocation: LocationData.fromMap(data['pickupLocation'] as Map<String, dynamic>? ?? {}),
      dropoffLocation: LocationData.fromMap(data['dropoffLocation'] as Map<String, dynamic>? ?? {}),
      status: data['status'] as String? ?? '',
      createdAt: DateTime.parse(data['createdAt'] as String? ?? ''),
      completedAt: data['completedAt'] != null ? DateTime.parse(data['completedAt'] as String) : null,
      fare: (data['fare'] as num?)?.toDouble() ?? 0,
      distance: (data['distance'] as num?)?.toDouble(),
      duration: data['duration'] as int?,
      paymentMethod: data['paymentMethod'] as String? ?? '',
      paymentStatus: data['paymentStatus'] as String? ?? '',
      rating: (data['rating'] as num?)?.toDouble(),
      review: data['review'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'driverId': driverId,
      'serviceType': serviceType,
      'pickupLocation': pickupLocation.toMap(),
      'dropoffLocation': dropoffLocation.toMap(),
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'fare': fare,
      'distance': distance,
      'duration': duration,
      'paymentMethod': paymentMethod,
      'paymentStatus': paymentStatus,
      'rating': rating,
      'review': review,
    };
  }
}
