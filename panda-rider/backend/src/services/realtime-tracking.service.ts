import { collections, db } from '../config/firebase';
import { getDirections, getDistanceMatrix, reverseGeocode } from '../config/google-maps';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { notificationService } from './notification.service';
import { whatsappService } from './whatsapp.service';

// Real-time driver location with socket support
interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  accuracy: number;
  timestamp: Date;
  tripId?: string;
}

interface ETAUpdate {
  tripId: string;
  distanceRemaining: number;
  durationRemaining: number;
  eta: Date;
  status: 'on_track' | 'delayed' | 'ahead';
}

export class RealTimeTrackingService {
  private locationUpdateInterval = 5000; // 5 seconds
  private etaRecalculationThreshold = 0.5; // km deviation triggers recalculation

  // Update driver location (called from mobile app every 5 seconds)
  async updateDriverLocation(data: DriverLocation): Promise<{
    success: boolean;
    eta?: ETAUpdate;
    shouldNotifyCustomer: boolean;
  }> {
    const { driverId, lat, lng, heading, speed, accuracy, tripId } = data;

    // Store location in Firestore (real-time)
    const locationRef = collections.drivers.doc(driverId);
    await locationRef.update({
      'location.lat': lat,
      'location.lng': lng,
      'location.heading': heading,
      'location.speed': speed,
      'location.accuracy': accuracy,
      'location.updatedAt': Timestamp.now(),
      'location.geohash': this.generateGeohash(lat, lng),
    });

    // Store in location history for analytics
    await collections.drivers
      .doc(driverId)
      .collection('locationHistory')
      .add({
        lat,
        lng,
        heading,
        speed,
        timestamp: Timestamp.now(),
        tripId: tripId || null,
      });

    let eta: ETAUpdate | undefined;
    let shouldNotifyCustomer = false;

    // If driver is on a trip, calculate ETA
    if (tripId) {
      eta = await this.calculateTripETA(tripId, { lat, lng });
      
      // Check if we should notify customer about delays or arrivals
      if (eta) {
        if (eta.status === 'delayed' && eta.durationRemaining > 2) {
          shouldNotifyCustomer = true;
        }
        if (eta.distanceRemaining < 0.3) { // Less than 300m
          shouldNotifyCustomer = true;
        }
      }
    }

    return { success: true, eta, shouldNotifyCustomer };
  }

  // Calculate ETA for active trip
  async calculateTripETA(
    tripId: string,
    currentLocation: { lat: number; lng: number }
  ): Promise<ETAUpdate | null> {
    const tripDoc = await collections.trips.doc(tripId).get();
    if (!tripDoc.exists) return null;

    const trip = tripDoc.data();
    if (!trip) return null;

    // Determine destination based on trip status
    let destination: { lat: number; lng: number };
    if (trip.status === 'accepted' || trip.status === 'arriving') {
      destination = { lat: trip.pickup.lat, lng: trip.pickup.lng };
    } else if (trip.status === 'in_progress') {
      destination = { lat: trip.dropoff.lat, lng: trip.dropoff.lng };
    } else {
      return null;
    }

    // Get real-time ETA from Google Maps
    const distanceData = await getDistanceMatrix(currentLocation, destination);

    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + distanceData.duration);

    // Calculate status
    let status: 'on_track' | 'delayed' | 'ahead' = 'on_track';
    const originalDuration = trip.route?.duration || distanceData.duration;
    
    if (distanceData.duration > originalDuration * 1.2) {
      status = 'delayed';
    } else if (distanceData.duration < originalDuration * 0.8) {
      status = 'ahead';
    }

    const etaUpdate: ETAUpdate = {
      tripId,
      distanceRemaining: distanceData.distance,
      durationRemaining: distanceData.duration,
      eta,
      status,
    };

    // Update trip with latest ETA
    await collections.trips.doc(tripId).update({
      'realTimeData.currentDriverLocation': currentLocation,
      'realTimeData.eta': Timestamp.fromDate(eta),
      'realTimeData.distanceRemaining': distanceData.distance,
      'realTimeData.durationRemaining': distanceData.duration,
      'realTimeData.updatedAt': Timestamp.now(),
    });

    return etaUpdate;
  }

  // Get live trip tracking data for customer
  async getLiveTripData(tripId: string): Promise<{
    driverLocation: { lat: number; lng: number; heading: number } | null;
    eta: Date | null;
    distanceRemaining: number;
    durationRemaining: number;
    route: { polyline: string } | null;
    driverInfo: { name: string; photo: string; rating: number; vehicle: string; plate: string } | null;
    status: string;
  }> {
    const tripDoc = await collections.trips.doc(tripId).get();
    if (!tripDoc.exists) {
      throw new Error('Trip not found');
    }

    const trip = tripDoc.data()!;
    let driverLocation = null;
    let driverInfo = null;

    if (trip.driverId) {
      const driverDoc = await collections.drivers.doc(trip.driverId).get();
      if (driverDoc.exists) {
        const driver = driverDoc.data()!;
        driverLocation = {
          lat: driver.location?.lat || 0,
          lng: driver.location?.lng || 0,
          heading: driver.location?.heading || 0,
        };
        driverInfo = {
          name: driver.firstName + ' ' + driver.lastName,
          photo: driver.profilePhoto || '',
          rating: driver.rating || 4.5,
          vehicle: `${driver.vehicleDetails?.make} ${driver.vehicleDetails?.model}`,
          plate: driver.vehicleDetails?.plate || '',
        };
      }
    }

    return {
      driverLocation,
      eta: trip.realTimeData?.eta?.toDate() || null,
      distanceRemaining: trip.realTimeData?.distanceRemaining || 0,
      durationRemaining: trip.realTimeData?.durationRemaining || 0,
      route: trip.route ? { polyline: trip.route.polyline } : null,
      driverInfo,
      status: trip.status,
    };
  }

  // Notify customer about driver status
  async notifyCustomerETAUpdate(
    tripId: string,
    customerId: string,
    eta: ETAUpdate,
    customerPhone?: string
  ): Promise<void> {
    // Push notification
    await notificationService.sendETAUpdate(customerId, tripId, {
      minutes: Math.round(eta.durationRemaining),
      status: eta.status,
    });

    // WhatsApp notification for significant updates
    if (customerPhone && (eta.status === 'delayed' || eta.distanceRemaining < 0.3)) {
      const message = eta.distanceRemaining < 0.3
        ? `Your Panda driver is almost there! Just ${Math.round(eta.distanceRemaining * 1000)}m away.`
        : `Traffic update: Your driver is running about ${Math.round(eta.durationRemaining - (eta.durationRemaining / 1.2))} minutes late. New ETA: ${eta.eta.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`;

      await whatsappService.sendTextMessage(customerPhone, message);
    }
  }

  // Stream live location updates (for WebSocket/SSE)
  async *streamDriverLocation(
    tripId: string
  ): AsyncGenerator<{ lat: number; lng: number; heading: number; eta: Date | null }> {
    // This would typically use Firestore real-time listeners
    // For now, we simulate with periodic polling
    while (true) {
      const tripData = await this.getLiveTripData(tripId);
      if (!tripData.driverLocation || tripData.status === 'completed' || tripData.status === 'cancelled') {
        break;
      }
      yield {
        ...tripData.driverLocation,
        eta: tripData.eta,
      };
      await new Promise((resolve) => setTimeout(resolve, this.locationUpdateInterval));
    }
  }

  // Generate geohash for location queries
  private generateGeohash(lat: number, lng: number): string {
    // Simplified geohash for demo - in production use a proper library
    const latBits = Math.floor((lat + 90) / 180 * 4096);
    const lngBits = Math.floor((lng + 180) / 360 * 4096);
    return `${latBits.toString(16)}${lngBits.toString(16)}`;
  }

  // Find nearby drivers within radius
  async findNearbyDrivers(
    lat: number,
    lng: number,
    radiusKm: number = 5
  ): Promise<Array<{
    driverId: string;
    lat: number;
    lng: number;
    distance: number;
    vehicleType: string;
    rating: number;
  }>> {
    // Get all online drivers (in production, use geohash queries)
    const driversSnapshot = await collections.drivers
      .where('isOnline', '==', true)
      .where('isAvailable', '==', true)
      .get();

    const nearbyDrivers: Array<{
      driverId: string;
      lat: number;
      lng: number;
      distance: number;
      vehicleType: string;
      rating: number;
    }> = [];

    for (const doc of driversSnapshot.docs) {
      const driver = doc.data();
      if (driver.location?.lat && driver.location?.lng) {
        const distance = this.calculateDistance(
          lat,
          lng,
          driver.location.lat,
          driver.location.lng
        );

        if (distance <= radiusKm) {
          nearbyDrivers.push({
            driverId: doc.id,
            lat: driver.location.lat,
            lng: driver.location.lng,
            distance,
            vehicleType: driver.vehicleType,
            rating: driver.rating || 4.5,
          });
        }
      }
    }

    return nearbyDrivers.sort((a, b) => a.distance - b.distance);
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const realTimeTrackingService = new RealTimeTrackingService();
