import { collections, db } from '../config/firebase';
import { getDirections } from '../config/google-maps';
import {
  Trip,
  TripStatus,
  ServiceType,
  VehicleType,
  Location,
  PaymentMethodType,
} from '../models/types';
import { ApiError, ErrorCodes } from '../utils/errors';
import { generateId, generateTripReference, generateGeohash } from '../utils/helpers';
import { appConfig } from '../config/app';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { driverService } from './driver.service';
import { fareService } from './fare.service';
import { paymentService } from './payment.service';
import { notificationService } from './notification.service';

export class TripService {
  // Create a new trip
  async create(
    customerId: string,
    data: {
      type: ServiceType;
      pickup: Location;
      dropoff: Location;
      vehicleType: VehicleType;
      paymentMethod: PaymentMethodType;
      paymentMethodId?: string;
      scheduledAt?: Date;
    }
  ): Promise<Trip> {
    // Get fare estimate
    const fareEstimate = await fareService.calculateEstimate(
      { lat: data.pickup.lat, lng: data.pickup.lng },
      { lat: data.dropoff.lat, lng: data.dropoff.lng },
      data.type,
      data.vehicleType
    );

    // Get route info
    const route = await getDirections(
      { lat: data.pickup.lat, lng: data.pickup.lng },
      { lat: data.dropoff.lat, lng: data.dropoff.lng }
    );

    const tripId = generateId();
    const tripRef = generateTripReference();

    const tripData: Omit<Trip, 'id'> = {
      customerId,
      type: data.type,
      status: 'pending',
      pickup: {
        ...data.pickup,
        geohash: generateGeohash(data.pickup.lat, data.pickup.lng),
      },
      dropoff: {
        ...data.dropoff,
        geohash: generateGeohash(data.dropoff.lat, data.dropoff.lng),
      },
      fare: fareEstimate.fare,
      payment: {
        method: data.paymentMethod,
        status: 'pending',
      },
      vehicleType: data.vehicleType,
      route: {
        polyline: route.polyline,
        distance: route.distance,
        duration: route.duration,
      },
      timestamps: {
        createdAt: Timestamp.now(),
      },
      scheduledAt: data.scheduledAt ? Timestamp.fromDate(data.scheduledAt) : undefined,
      metadata: {
        reference: tripRef,
      },
    };

    await collections.trips.doc(tripId).set(tripData);

    // If not scheduled, start finding drivers
    if (!data.scheduledAt) {
      this.findAndNotifyDrivers(tripId, data.pickup, data.type, data.vehicleType);
    }

    return { ...tripData, id: tripId };
  }

  // Find and notify nearby drivers
  private async findAndNotifyDrivers(
    tripId: string,
    pickup: Location,
    serviceType: ServiceType,
    vehicleType: VehicleType
  ): Promise<void> {
    const nearbyDrivers = await driverService.findNearby(
      pickup.lat,
      pickup.lng,
      appConfig.matching.searchRadiusKm,
      { vehicleType, serviceType }
    );

    if (nearbyDrivers.length === 0) {
      // No drivers available, expand search
      const extendedDrivers = await driverService.findNearby(
        pickup.lat,
        pickup.lng,
        appConfig.matching.maxSearchRadiusKm,
        { vehicleType, serviceType }
      );

      if (extendedDrivers.length === 0) {
        // Update trip status
        await this.updateStatus(tripId, 'cancelled', {
          cancelledBy: 'system',
          reason: 'No drivers available',
          fee: 0,
        });
        return;
      }
    }

    // Notify drivers about the trip
    for (const driver of nearbyDrivers.slice(0, appConfig.matching.maxDriversToNotify)) {
      await notificationService.sendTripRequest(driver.userId, tripId, {
        pickup: pickup.address,
        distance: driver.distance,
      });
    }
  }

  // Get trip by ID
  async getById(tripId: string): Promise<Trip | null> {
    const tripDoc = await collections.trips.doc(tripId).get();
    
    if (!tripDoc.exists) {
      return null;
    }

    return { ...tripDoc.data(), id: tripId } as Trip;
  }

  // Accept trip (driver)
  async accept(tripId: string, driverId: string): Promise<Trip> {
    const tripRef = collections.trips.doc(tripId);

    return await db.runTransaction(async (transaction) => {
      const tripDoc = await transaction.get(tripRef);

      if (!tripDoc.exists) {
        throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
      }

      const trip = tripDoc.data() as Trip;

      if (trip.status !== 'pending') {
        throw ApiError.badRequest(
          'Trip is no longer available',
          ErrorCodes.TRIP_ALREADY_ACCEPTED
        );
      }

      // Get driver info
      const driver = await driverService.getById(driverId);
      if (!driver) {
        throw ApiError.notFound('Driver not found', ErrorCodes.DRIVER_NOT_FOUND);
      }

      transaction.update(tripRef, {
        driverId,
        status: 'accepted',
        'timestamps.acceptedAt': Timestamp.now(),
      });

      // Set driver as unavailable
      await driverService.setAvailability(driverId, false);

      // Notify customer
      await notificationService.sendTripAccepted(trip.customerId, tripId, {
        driverName: 'Driver', // Would get from user profile
        vehicleType: driver.vehicleType,
        vehiclePlate: driver.vehicleDetails.plate,
      });

      return { ...trip, id: tripId, driverId, status: 'accepted' as TripStatus };
    });
  }

  // Update trip status
  async updateStatus(
    tripId: string,
    status: TripStatus,
    cancellation?: {
      cancelledBy: 'customer' | 'driver' | 'system';
      reason: string;
      fee: number;
    }
  ): Promise<Trip> {
    const tripRef = collections.trips.doc(tripId);
    const tripDoc = await tripRef.get();

    if (!tripDoc.exists) {
      throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
    }

    const trip = tripDoc.data() as Trip;

    // Validate status transition
    this.validateStatusTransition(trip.status, status);

    const updateData: any = {
      status,
      [`timestamps.${this.getTimestampField(status)}`]: Timestamp.now(),
    };

    if (cancellation) {
      updateData.cancellation = cancellation;
    }

    await tripRef.update(updateData);

    // Handle status-specific actions
    switch (status) {
      case 'arriving':
        if (trip.driverId) {
          await notificationService.sendDriverArriving(trip.customerId, tripId);
        }
        break;

      case 'arrived':
        if (trip.driverId) {
          await notificationService.sendDriverArrived(trip.customerId, tripId);
        }
        break;

      case 'in_progress':
        await notificationService.sendTripStarted(trip.customerId, tripId);
        break;

      case 'completed':
        await this.completeTrip(tripId, trip);
        break;

      case 'cancelled':
        if (trip.driverId) {
          await driverService.setAvailability(trip.driverId, true);
        }
        break;
    }

    const updatedDoc = await tripRef.get();
    return { ...updatedDoc.data(), id: tripId } as Trip;
  }

  // Complete trip
  private async completeTrip(tripId: string, trip: Trip): Promise<void> {
    // Process payment
    if (trip.payment.method === 'card' && trip.payment.paymentIntentId) {
      await paymentService.confirmPayment(trip.payment.paymentIntentId);
    } else if (trip.payment.method === 'wallet') {
      // Deduct from wallet (would use authService)
    }

    // Update trip payment status
    await collections.trips.doc(tripId).update({
      'payment.status': 'succeeded',
      'payment.paidAt': Timestamp.now(),
    });

    // Add earnings to driver
    if (trip.driverId) {
      const driverEarnings = fareService.calculateDriverEarnings(trip.fare.total);
      await driverService.addEarnings(trip.driverId, driverEarnings);
      await driverService.setAvailability(trip.driverId, true);
    }

    // Send completion notification
    await notificationService.sendTripCompleted(trip.customerId, tripId, {
      fare: trip.fare.total,
      currency: trip.fare.currency,
    });
  }

  // Validate status transition
  private validateStatusTransition(current: TripStatus, next: TripStatus): void {
    const validTransitions: Record<TripStatus, TripStatus[]> = {
      pending: ['accepted', 'cancelled'],
      accepted: ['arriving', 'cancelled'],
      arriving: ['arrived', 'cancelled'],
      arrived: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[current].includes(next)) {
      throw ApiError.badRequest(
        `Cannot transition from ${current} to ${next}`,
        ErrorCodes.INVALID_TRIP_STATUS
      );
    }
  }

  // Get timestamp field name for status
  private getTimestampField(status: TripStatus): string {
    const map: Record<TripStatus, string> = {
      pending: 'createdAt',
      accepted: 'acceptedAt',
      arriving: 'acceptedAt', // No separate field
      arrived: 'arrivedAt',
      in_progress: 'startedAt',
      completed: 'completedAt',
      cancelled: 'cancelledAt',
    };
    return map[status];
  }

  // Get trip history for user
  async getHistory(
    userId: string,
    role: 'customer' | 'driver',
    options?: {
      status?: TripStatus;
      type?: ServiceType;
      page?: number;
      limit?: number;
    }
  ): Promise<{ trips: Trip[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const field = role === 'customer' ? 'customerId' : 'driverId';

    let query = collections.trips
      .where(field, '==', userId)
      .orderBy('timestamps.createdAt', 'desc');

    if (options?.status) {
      query = query.where('status', '==', options.status);
    }

    if (options?.type) {
      query = query.where('type', '==', options.type);
    }

    const snapshot = await query.get();
    const total = snapshot.size;

    const trips = snapshot.docs
      .slice(offset, offset + limit)
      .map((doc) => ({ ...doc.data(), id: doc.id } as Trip));

    return { trips, total };
  }

  // Get active trips
  async getActiveTrips(userId: string, role: 'customer' | 'driver'): Promise<Trip[]> {
    const field = role === 'customer' ? 'customerId' : 'driverId';
    const activeStatuses: TripStatus[] = ['pending', 'accepted', 'arriving', 'arrived', 'in_progress'];

    const snapshot = await collections.trips
      .where(field, '==', userId)
      .where('status', 'in', activeStatuses)
      .get();

    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Trip));
  }

  // Cancel trip
  async cancel(tripId: string, cancelledBy: 'customer' | 'driver', reason: string): Promise<Trip> {
    const trip = await this.getById(tripId);

    if (!trip) {
      throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
    }

    if (['completed', 'cancelled'].includes(trip.status)) {
      throw ApiError.badRequest(
        'Trip cannot be cancelled',
        ErrorCodes.TRIP_CANNOT_BE_CANCELLED
      );
    }

    // Calculate cancellation fee
    const fee = fareService.calculateCancellationFee(
      trip.fare.total,
      trip.status as 'pending' | 'accepted' | 'arriving'
    );

    return await this.updateStatus(tripId, 'cancelled', {
      cancelledBy,
      reason,
      fee,
    });
  }
}

export const tripService = new TripService();
