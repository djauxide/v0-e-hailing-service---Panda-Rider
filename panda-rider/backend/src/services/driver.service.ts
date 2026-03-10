import { collections, db } from '../config/firebase';
import { Driver, VehicleType, ServiceType, DriverStatus, Location } from '../models/types';
import { ApiError, ErrorCodes } from '../utils/errors';
import { generateGeohash, getGeohashBounds, calculateDistance, generateId } from '../utils/helpers';
import { appConfig } from '../config/app';
import { Timestamp } from 'firebase-admin/firestore';

export class DriverService {
  // Register as a driver
  async register(
    userId: string,
    data: {
      vehicleType: VehicleType;
      vehicleDetails: {
        make: string;
        model: string;
        year: number;
        plate: string;
        color: string;
      };
      serviceTypes: ServiceType[];
    }
  ): Promise<Driver> {
    // Check if already registered as driver
    const existingDriver = await collections.drivers
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existingDriver.empty) {
      throw ApiError.conflict(
        'Already registered as a driver',
        ErrorCodes.ALREADY_REGISTERED_AS_DRIVER
      );
    }

    const driverId = generateId();

    const driverData: Omit<Driver, 'id'> = {
      userId,
      vehicleType: data.vehicleType,
      vehicleDetails: data.vehicleDetails,
      documents: {
        license: { url: '', verified: false, uploadedAt: Timestamp.now() },
        insurance: { url: '', verified: false, uploadedAt: Timestamp.now() },
        registration: { url: '', verified: false, uploadedAt: Timestamp.now() },
        profilePhoto: '',
      },
      isOnline: false,
      isAvailable: false,
      serviceTypes: data.serviceTypes,
      status: 'pending',
      earnings: {
        today: 0,
        week: 0,
        month: 0,
        total: 0,
        currency: 'USD',
      },
      rating: 5.0,
      totalTrips: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await collections.drivers.doc(driverId).set(driverData);

    // Update user role to driver
    await collections.users.doc(userId).update({
      role: 'driver',
      updatedAt: Timestamp.now(),
    });

    return { ...driverData, id: driverId };
  }

  // Get driver by ID
  async getById(driverId: string): Promise<Driver | null> {
    const driverDoc = await collections.drivers.doc(driverId).get();
    
    if (!driverDoc.exists) {
      return null;
    }

    return { ...driverDoc.data(), id: driverId } as Driver;
  }

  // Get driver by user ID
  async getByUserId(userId: string): Promise<Driver | null> {
    const snapshot = await collections.drivers
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as Driver;
  }

  // Update online status
  async updateStatus(driverId: string, isOnline: boolean): Promise<Driver> {
    const driverRef = collections.drivers.doc(driverId);
    const driverDoc = await driverRef.get();

    if (!driverDoc.exists) {
      throw ApiError.notFound('Driver not found', ErrorCodes.DRIVER_NOT_FOUND);
    }

    const driver = driverDoc.data() as Driver;

    if (driver.status !== 'approved') {
      throw ApiError.forbidden(
        'Driver is not approved',
        ErrorCodes.DRIVER_NOT_APPROVED
      );
    }

    await driverRef.update({
      isOnline,
      isAvailable: isOnline, // When going online, become available
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await driverRef.get();
    return { ...updatedDoc.data(), id: driverId } as Driver;
  }

  // Update driver location
  async updateLocation(
    driverId: string,
    location: { lat: number; lng: number; heading?: number; speed?: number }
  ): Promise<void> {
    const driverRef = collections.drivers.doc(driverId);
    
    const geohash = generateGeohash(location.lat, location.lng);

    await driverRef.update({
      currentLocation: {
        lat: location.lat,
        lng: location.lng,
        geohash,
        address: '', // Will be reverse geocoded if needed
      },
      updatedAt: Timestamp.now(),
    });

    // Also store in a separate real-time location collection for faster queries
    await db.collection('driver_locations').doc(driverId).set({
      lat: location.lat,
      lng: location.lng,
      geohash,
      heading: location.heading || 0,
      speed: location.speed || 0,
      timestamp: Timestamp.now(),
    });
  }

  // Find nearby available drivers
  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number = 5,
    options?: {
      vehicleType?: VehicleType;
      serviceType?: ServiceType;
      limit?: number;
    }
  ): Promise<Array<Driver & { distance: number }>> {
    const bounds = getGeohashBounds(lat, lng, radiusKm);
    const drivers: Array<Driver & { distance: number }> = [];

    // Query for each geohash bound
    for (const { geohashMin, geohashMax } of bounds) {
      let query = collections.drivers
        .where('isOnline', '==', true)
        .where('isAvailable', '==', true)
        .where('status', '==', 'approved')
        .where('currentLocation.geohash', '>=', geohashMin)
        .where('currentLocation.geohash', '<=', geohashMax);

      if (options?.vehicleType) {
        query = query.where('vehicleType', '==', options.vehicleType);
      }

      const snapshot = await query.get();

      for (const doc of snapshot.docs) {
        const driver = { ...doc.data(), id: doc.id } as Driver;

        // Check service type
        if (options?.serviceType && !driver.serviceTypes.includes(options.serviceType)) {
          continue;
        }

        // Calculate actual distance
        if (driver.currentLocation) {
          const distance = calculateDistance(
            lat,
            lng,
            driver.currentLocation.lat,
            driver.currentLocation.lng
          );

          // Only include if within radius
          if (distance <= radiusKm) {
            drivers.push({ ...driver, distance });
          }
        }
      }
    }

    // Sort by distance and limit
    drivers.sort((a, b) => a.distance - b.distance);
    
    const limit = options?.limit || appConfig.matching.maxDriversToNotify;
    return drivers.slice(0, limit);
  }

  // Set driver availability
  async setAvailability(driverId: string, isAvailable: boolean): Promise<void> {
    await collections.drivers.doc(driverId).update({
      isAvailable,
      updatedAt: Timestamp.now(),
    });
  }

  // Upload document
  async uploadDocument(
    driverId: string,
    documentType: 'license' | 'insurance' | 'registration' | 'profilePhoto',
    url: string,
    expiryDate?: Date
  ): Promise<void> {
    const updateData: any = {
      [`documents.${documentType}`]:
        documentType === 'profilePhoto'
          ? url
          : {
              url,
              verified: false,
              expiryDate: expiryDate ? Timestamp.fromDate(expiryDate) : null,
              uploadedAt: Timestamp.now(),
            },
      updatedAt: Timestamp.now(),
    };

    await collections.drivers.doc(driverId).update(updateData);
  }

  // Get driver earnings
  async getEarnings(
    driverId: string,
    period?: 'today' | 'week' | 'month' | 'all'
  ): Promise<{
    earnings: number;
    trips: number;
    currency: string;
  }> {
    const driverDoc = await collections.drivers.doc(driverId).get();

    if (!driverDoc.exists) {
      throw ApiError.notFound('Driver not found', ErrorCodes.DRIVER_NOT_FOUND);
    }

    const driver = driverDoc.data() as Driver;
    
    let earnings: number;
    switch (period) {
      case 'today':
        earnings = driver.earnings.today;
        break;
      case 'week':
        earnings = driver.earnings.week;
        break;
      case 'month':
        earnings = driver.earnings.month;
        break;
      default:
        earnings = driver.earnings.total;
    }

    return {
      earnings,
      trips: driver.totalTrips,
      currency: driver.earnings.currency,
    };
  }

  // Add earnings to driver
  async addEarnings(driverId: string, amount: number): Promise<void> {
    await collections.drivers.doc(driverId).update({
      'earnings.today': db.FieldValue.increment(amount),
      'earnings.week': db.FieldValue.increment(amount),
      'earnings.month': db.FieldValue.increment(amount),
      'earnings.total': db.FieldValue.increment(amount),
      totalTrips: db.FieldValue.increment(1),
      updatedAt: Timestamp.now(),
    });
  }

  // Approve driver (admin)
  async approve(driverId: string, approved: boolean, reason?: string): Promise<Driver> {
    const driverRef = collections.drivers.doc(driverId);
    const driverDoc = await driverRef.get();

    if (!driverDoc.exists) {
      throw ApiError.notFound('Driver not found', ErrorCodes.DRIVER_NOT_FOUND);
    }

    const status: DriverStatus = approved ? 'approved' : 'rejected';

    await driverRef.update({
      status,
      rejectionReason: approved ? null : reason,
      approvedAt: approved ? Timestamp.now() : null,
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await driverRef.get();
    return { ...updatedDoc.data(), id: driverId } as Driver;
  }

  // Suspend driver (admin)
  async suspend(driverId: string, reason: string): Promise<Driver> {
    const driverRef = collections.drivers.doc(driverId);
    const driverDoc = await driverRef.get();

    if (!driverDoc.exists) {
      throw ApiError.notFound('Driver not found', ErrorCodes.DRIVER_NOT_FOUND);
    }

    await driverRef.update({
      status: 'suspended',
      suspensionReason: reason,
      isOnline: false,
      isAvailable: false,
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await driverRef.get();
    return { ...updatedDoc.data(), id: driverId } as Driver;
  }

  // Get all drivers (admin)
  async getAll(options?: {
    status?: DriverStatus;
    page?: number;
    limit?: number;
  }): Promise<{ drivers: Driver[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    let query = collections.drivers.orderBy('createdAt', 'desc');

    if (options?.status) {
      query = query.where('status', '==', options.status);
    }

    const snapshot = await query.get();
    const total = snapshot.size;

    const drivers = snapshot.docs
      .slice(offset, offset + limit)
      .map((doc) => ({ ...doc.data(), id: doc.id } as Driver));

    return { drivers, total };
  }
}

export const driverService = new DriverService();
