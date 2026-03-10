class Driver {
  final String id;
  final String email;
  final String name;
  final String phone;
  final bool isOnline;
  final double rating;
  final int totalTrips;
  final String licenseNumber;
  final String vehicleType;
  final String licensePlate;
  final double earnings;
  final bool isVerified;

  Driver({
    required this.id,
    required this.email,
    required this.name,
    required this.phone,
    required this.isOnline,
    required this.rating,
    required this.totalTrips,
    required this.licenseNumber,
    required this.vehicleType,
    required this.licensePlate,
    required this.earnings,
    required this.isVerified,
  });

  factory Driver.fromMap(Map<String, dynamic> data) {
    return Driver(
      id: data['id'] ?? '',
      email: data['email'] ?? '',
      name: data['name'] ?? '',
      phone: data['phone'] ?? '',
      isOnline: data['isOnline'] ?? false,
      rating: (data['rating'] as num?)?.toDouble() ?? 0,
      totalTrips: data['totalTrips'] ?? 0,
      licenseNumber: data['licenseNumber'] ?? '',
      vehicleType: data['vehicleType'] ?? '',
      licensePlate: data['licensePlate'] ?? '',
      earnings: (data['earnings'] as num?)?.toDouble() ?? 0,
      isVerified: data['isVerified'] ?? false,
    );
  }
}

class Trip {
  final String id;
  final String userId;
  final String driverId;
  final String status;
  final double pickupLatitude;
  final double pickupLongitude;
  final double dropoffLatitude;
  final double dropoffLongitude;
  final double fare;
  final String pickupAddress;
  final String dropoffAddress;

  Trip({
    required this.id,
    required this.userId,
    required this.driverId,
    required this.status,
    required this.pickupLatitude,
    required this.pickupLongitude,
    required this.dropoffLatitude,
    required this.dropoffLongitude,
    required this.fare,
    required this.pickupAddress,
    required this.dropoffAddress,
  });

  factory Trip.fromMap(Map<String, dynamic> data) {
    return Trip(
      id: data['id'] ?? '',
      userId: data['userId'] ?? '',
      driverId: data['driverId'] ?? '',
      status: data['status'] ?? '',
      pickupLatitude: (data['pickupLatitude'] as num?)?.toDouble() ?? 0,
      pickupLongitude: (data['pickupLongitude'] as num?)?.toDouble() ?? 0,
      dropoffLatitude: (data['dropoffLatitude'] as num?)?.toDouble() ?? 0,
      dropoffLongitude: (data['dropoffLongitude'] as num?)?.toDouble() ?? 0,
      fare: (data['fare'] as num?)?.toDouble() ?? 0,
      pickupAddress: data['pickupAddress'] ?? '',
      dropoffAddress: data['dropoffAddress'] ?? '',
    );
  }
}
