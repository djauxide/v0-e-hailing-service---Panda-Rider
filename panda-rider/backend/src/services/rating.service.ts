import { collections, db } from '../config/firebase';
import { Rating, Trip } from '../models/types';
import { ApiError, ErrorCodes } from '../utils/errors';
import { generateId, roundToTwoDecimals } from '../utils/helpers';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export class RatingService {
  // Submit a rating
  async submitRating(
    userId: string,
    tripId: string,
    rating: number,
    comment?: string
  ): Promise<Rating> {
    // Get trip
    const tripDoc = await collections.trips.doc(tripId).get();

    if (!tripDoc.exists) {
      throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
    }

    const trip = tripDoc.data() as Trip;

    // Check if trip is completed
    if (trip.status !== 'completed') {
      throw ApiError.badRequest(
        'Can only rate completed trips',
        ErrorCodes.TRIP_NOT_COMPLETED
      );
    }

    // Determine rating type
    let type: 'customer_to_driver' | 'driver_to_customer';
    let toUserId: string;

    if (userId === trip.customerId) {
      // Customer rating driver
      type = 'customer_to_driver';
      toUserId = trip.driverId!;

      // Check if already rated
      if (trip.rating?.byCustomer) {
        throw ApiError.badRequest('Already rated this trip', ErrorCodes.ALREADY_RATED);
      }
    } else if (userId === trip.driverId) {
      // Driver rating customer
      type = 'driver_to_customer';
      toUserId = trip.customerId;

      // Check if already rated
      if (trip.rating?.byDriver) {
        throw ApiError.badRequest('Already rated this trip', ErrorCodes.ALREADY_RATED);
      }
    } else {
      throw ApiError.forbidden('Not authorized to rate this trip');
    }

    const ratingId = generateId();

    const ratingData: Omit<Rating, 'id'> = {
      tripId,
      fromUserId: userId,
      toUserId,
      rating,
      comment,
      type,
      createdAt: Timestamp.now(),
    };

    // Save rating
    await collections.ratings.doc(ratingId).set(ratingData);

    // Update trip with rating
    const ratingField = type === 'customer_to_driver' ? 'rating.byCustomer' : 'rating.byDriver';
    await collections.trips.doc(tripId).update({
      [ratingField]: {
        rating,
        comment,
        createdAt: Timestamp.now(),
      },
    });

    // Update user's average rating
    await this.updateUserRating(toUserId, type === 'customer_to_driver' ? 'driver' : 'customer');

    return { ...ratingData, id: ratingId };
  }

  // Update user's average rating
  private async updateUserRating(
    userId: string,
    userType: 'customer' | 'driver'
  ): Promise<void> {
    const ratingType: Rating['type'] =
      userType === 'driver' ? 'customer_to_driver' : 'driver_to_customer';

    // Get all ratings for this user
    const ratingsSnapshot = await collections.ratings
      .where('toUserId', '==', userId)
      .where('type', '==', ratingType)
      .get();

    if (ratingsSnapshot.empty) {
      return;
    }

    // Calculate average
    let totalRating = 0;
    ratingsSnapshot.docs.forEach((doc) => {
      totalRating += doc.data().rating;
    });

    const averageRating = roundToTwoDecimals(totalRating / ratingsSnapshot.size);

    // Update user or driver document
    if (userType === 'driver') {
      // Find driver document by userId
      const driverSnapshot = await collections.drivers
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (!driverSnapshot.empty) {
        await driverSnapshot.docs[0].ref.update({
          rating: averageRating,
          updatedAt: Timestamp.now(),
        });
      }
    }

    // Also update user document
    await collections.users.doc(userId).update({
      rating: averageRating,
      updatedAt: Timestamp.now(),
    });
  }

  // Get ratings for a user
  async getUserRatings(
    userId: string,
    options?: {
      type?: 'received' | 'given';
      page?: number;
      limit?: number;
    }
  ): Promise<{ ratings: Rating[]; total: number; average: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const field = options?.type === 'given' ? 'fromUserId' : 'toUserId';

    const snapshot = await collections.ratings
      .where(field, '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const total = snapshot.size;

    // Calculate average
    let totalRating = 0;
    snapshot.docs.forEach((doc) => {
      totalRating += doc.data().rating;
    });

    const average = total > 0 ? roundToTwoDecimals(totalRating / total) : 0;

    const ratings = snapshot.docs
      .slice(offset, offset + limit)
      .map((doc) => ({ ...doc.data(), id: doc.id } as Rating));

    return { ratings, total, average };
  }

  // Get rating for a specific trip
  async getTripRating(tripId: string): Promise<{
    byCustomer?: { rating: number; comment?: string };
    byDriver?: { rating: number; comment?: string };
  }> {
    const tripDoc = await collections.trips.doc(tripId).get();

    if (!tripDoc.exists) {
      throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
    }

    const trip = tripDoc.data() as Trip;
    return trip.rating || {};
  }

  // Get rating statistics for a driver
  async getDriverRatingStats(driverId: string): Promise<{
    average: number;
    total: number;
    distribution: Record<number, number>;
  }> {
    // Get driver's userId
    const driverDoc = await collections.drivers.doc(driverId).get();

    if (!driverDoc.exists) {
      throw ApiError.notFound('Driver not found', ErrorCodes.DRIVER_NOT_FOUND);
    }

    const driver = driverDoc.data();
    const userId = driver?.userId;

    const ratingsSnapshot = await collections.ratings
      .where('toUserId', '==', userId)
      .where('type', '==', 'customer_to_driver')
      .get();

    const total = ratingsSnapshot.size;

    if (total === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    let totalRating = 0;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    ratingsSnapshot.docs.forEach((doc) => {
      const rating = doc.data().rating;
      totalRating += rating;
      distribution[rating]++;
    });

    return {
      average: roundToTwoDecimals(totalRating / total),
      total,
      distribution,
    };
  }
}

export const ratingService = new RatingService();
