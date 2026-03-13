import { appConfig } from '../config/app';
import { getDistanceMatrix } from '../config/google-maps';
import { VehicleType, ServiceType, TripFare, VehicleOption, FareEstimate } from '../models/types';
import { roundToTwoDecimals, calculateETA } from '../utils/helpers';
import { driverService } from './driver.service';

export class FareService {
  private config = appConfig.fare;

  // Calculate fare estimate
  async calculateEstimate(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number },
    serviceType: ServiceType,
    vehicleType?: VehicleType
  ): Promise<FareEstimate> {
    // Get distance and duration from Google Maps
    const { distance, duration } = await getDistanceMatrix(pickup, dropoff);

    // Get surge multiplier based on demand
    const surgeMultiplier = await this.getSurgeMultiplier(pickup.lat, pickup.lng);

    // Calculate fare for requested vehicle type or all types
    const vehicleTypes: VehicleType[] = vehicleType
      ? [vehicleType]
      : ['car', 'motorcycle', 'bicycle'];

    const vehicleOptions: VehicleOption[] = [];

    for (const vType of vehicleTypes) {
      const fare = this.calculateFare(distance, duration, serviceType, vType, surgeMultiplier);
      
      // Get ETA for this vehicle type
      const nearbyDrivers = await driverService.findNearby(
        pickup.lat,
        pickup.lng,
        appConfig.matching.searchRadiusKm,
        { vehicleType: vType, serviceType, limit: 1 }
      );

      const eta = nearbyDrivers.length > 0
        ? calculateETA(nearbyDrivers[0].distance)
        : -1; // -1 means no drivers available

      vehicleOptions.push({
        type: vType,
        fare: fare.total,
        eta,
        available: nearbyDrivers.length > 0,
      });
    }

    // Get the primary fare (for the requested type or car by default)
    const primaryVehicle = vehicleType || 'car';
    const primaryFare = this.calculateFare(
      distance,
      duration,
      serviceType,
      primaryVehicle,
      surgeMultiplier
    );

    return {
      distance,
      duration,
      fare: primaryFare,
      vehicleOptions,
    };
  }

  // Calculate fare breakdown
  calculateFare(
    distanceKm: number,
    durationMinutes: number,
    serviceType: ServiceType,
    vehicleType: VehicleType,
    surgeMultiplier: number = 1.0
  ): TripFare {
    const baseFare = this.config.baseFare[vehicleType];
    const distanceCharge = distanceKm * this.config.perKmRate;
    const timeCharge = durationMinutes * this.config.perMinuteRate;

    // Apply vehicle and service multipliers
    const vehicleMultiplier = this.config.vehicleMultipliers[vehicleType];
    const serviceMultiplier = this.config.serviceMultipliers[serviceType];

    // Calculate subtotal
    const subtotal = (baseFare + distanceCharge + timeCharge) * vehicleMultiplier * serviceMultiplier;

    // Apply surge
    const surgeAmount = subtotal * (surgeMultiplier - 1);
    const totalBeforeMinimum = subtotal + surgeAmount;

    // Apply minimum fare
    const total = Math.max(totalBeforeMinimum, this.config.minimumFare);

    return {
      base: roundToTwoDecimals(baseFare),
      distance: roundToTwoDecimals(distanceCharge * vehicleMultiplier),
      time: roundToTwoDecimals(timeCharge * vehicleMultiplier),
      surge: roundToTwoDecimals(surgeAmount),
      surgeMultiplier: roundToTwoDecimals(surgeMultiplier),
      waitingTime: 0,
      toll: 0,
      discount: 0,
      total: roundToTwoDecimals(total),
      currency: 'ZAR',
    };
  }

  // Get surge multiplier based on location and demand
  async getSurgeMultiplier(lat: number, lng: number): Promise<number> {
    // Find number of available drivers
    const availableDrivers = await driverService.findNearby(
      lat,
      lng,
      appConfig.matching.searchRadiusKm,
      { limit: 20 }
    );

    // Get pending trips in the area
    // This would query for trips with status 'pending' near the location
    // For simplicity, we'll use a mock calculation

    const driverCount = availableDrivers.length;

    // Simple surge calculation
    // No drivers: max surge
    // Few drivers: higher surge
    // Many drivers: no surge
    if (driverCount === 0) {
      return this.config.surgeMultiplierMax;
    } else if (driverCount <= 2) {
      return Math.min(2.0, this.config.surgeMultiplierMax);
    } else if (driverCount <= 5) {
      return Math.min(1.5, this.config.surgeMultiplierMax);
    } else if (driverCount <= 10) {
      return 1.2;
    }

    return 1.0; // No surge
  }

  // Calculate waiting time charge
  calculateWaitingCharge(waitingMinutes: number): number {
    const freeWaitTime = appConfig.trip.freeWaitTimeMinutes;
    const chargeableMinutes = Math.max(0, waitingMinutes - freeWaitTime);
    return roundToTwoDecimals(chargeableMinutes * appConfig.trip.perMinuteWaitingRate);
  }

  // Calculate cancellation fee
  calculateCancellationFee(tripTotal: number, stage: 'pending' | 'accepted' | 'arriving'): number {
    switch (stage) {
      case 'pending':
        return 0; // Free cancellation when searching for driver
      case 'accepted':
        return roundToTwoDecimals(tripTotal * 0.1); // 10% fee
      case 'arriving':
        return roundToTwoDecimals(tripTotal * 0.2); // 20% fee when driver is on the way
      default:
        return 0;
    }
  }

  // Apply promo code
  applyPromoDiscount(fare: TripFare, discountPercent: number, maxDiscount: number): TripFare {
    const discount = Math.min(
      fare.total * (discountPercent / 100),
      maxDiscount
    );

    return {
      ...fare,
      discount: roundToTwoDecimals(discount),
      total: roundToTwoDecimals(fare.total - discount),
    };
  }

  // Calculate driver earnings (after platform commission)
  calculateDriverEarnings(tripTotal: number, commissionPercent: number = 20): number {
    return roundToTwoDecimals(tripTotal * (1 - commissionPercent / 100));
  }
}

export const fareService = new FareService();
