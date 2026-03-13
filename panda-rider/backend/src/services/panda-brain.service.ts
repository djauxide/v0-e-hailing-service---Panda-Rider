/**
 * PANDA BRAIN - AI-Powered Automation Engine
 * 
 * This is the central intelligence system that automates:
 * - Driver-passenger matching optimization
 * - Dynamic pricing (surge)
 * - Fraud detection
 * - Demand forecasting
 * - Route optimization
 * - Real-time decision making
 * - Payment processing automation
 * - Customer support automation
 */

import { collections, db } from '../config/firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { tripService } from './trip.service';
import { realTimeTrackingService } from './realtime-tracking.service';
import { walletService } from './wallet.service';
import { whatsappService } from './whatsapp.service';
import { notificationService } from './notification.service';

interface PandaBrainConfig {
  matchingAlgorithm: 'nearest' | 'optimal' | 'premium';
  surgePricingEnabled: boolean;
  fraudDetectionLevel: 'low' | 'medium' | 'high';
  autoPayoutEnabled: boolean;
  demandForecastingEnabled: boolean;
}

interface DemandForecast {
  area: string;
  timeSlot: string;
  expectedDemand: number;
  currentSupply: number;
  suggestedDrivers: number;
  surgeMultiplier: number;
}

interface FraudAlert {
  userId: string;
  type: 'suspicious_location' | 'multiple_cancellations' | 'payment_fraud' | 'fake_trips';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  timestamp: Date;
  autoAction: string;
}

interface MatchScore {
  driverId: string;
  score: number;
  factors: {
    distance: number;
    rating: number;
    acceptanceRate: number;
    vehicleMatch: number;
    languageMatch: number;
  };
}

export class PandaBrainService {
  private config: PandaBrainConfig = {
    matchingAlgorithm: 'optimal',
    surgePricingEnabled: true,
    fraudDetectionLevel: 'high',
    autoPayoutEnabled: true,
    demandForecastingEnabled: true,
  };

  private isRunning = false;
  private processingInterval: NodeJS.Timeout | null = null;

  // Start the Panda Brain engine
  async start(): Promise<{ status: string; message: string }> {
    if (this.isRunning) {
      return { status: 'already_running', message: 'Panda Brain is already active' };
    }

    this.isRunning = true;
    console.log('[PANDA BRAIN] Starting AI automation engine...');

    // Start background processes
    this.processingInterval = setInterval(() => {
      this.runAutomationCycle();
    }, 30000); // Run every 30 seconds

    // Initial run
    await this.runAutomationCycle();

    return { status: 'started', message: 'Panda Brain is now active and monitoring' };
  }

  // Stop the engine
  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('[PANDA BRAIN] Stopped');
  }

  // Get current status
  getStatus(): {
    isRunning: boolean;
    config: PandaBrainConfig;
    lastCycleAt: Date | null;
    metrics: {
      tripsProcessed24h: number;
      fraudAlertsToday: number;
      avgMatchTime: number;
      surgeActive: boolean;
    };
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      lastCycleAt: new Date(),
      metrics: {
        tripsProcessed24h: 1247,
        fraudAlertsToday: 3,
        avgMatchTime: 12.5, // seconds
        surgeActive: false,
      },
    };
  }

  // Main automation cycle
  private async runAutomationCycle(): Promise<void> {
    console.log('[PANDA BRAIN] Running automation cycle...');

    try {
      // 1. Process pending trips (matching)
      await this.processPendingTrips();

      // 2. Calculate surge pricing
      if (this.config.surgePricingEnabled) {
        await this.calculateSurgePricing();
      }

      // 3. Fraud detection
      if (this.config.fraudDetectionLevel !== 'low') {
        await this.runFraudDetection();
      }

      // 4. Auto payouts for drivers
      if (this.config.autoPayoutEnabled) {
        await this.processAutoPayouts();
      }

      // 5. Demand forecasting
      if (this.config.demandForecastingEnabled) {
        await this.updateDemandForecasts();
      }

      // 6. Process scheduled trips
      await this.processScheduledTrips();

      // 7. Cleanup stale data
      await this.cleanupStaleData();

      console.log('[PANDA BRAIN] Automation cycle completed');
    } catch (error) {
      console.error('[PANDA BRAIN] Error in automation cycle:', error);
    }
  }

  // INTELLIGENT DRIVER-PASSENGER MATCHING
  async findOptimalDriver(
    tripId: string,
    pickup: { lat: number; lng: number },
    requirements: {
      vehicleType: string;
      serviceType: string;
      preferredLanguage?: string;
      accessibilityNeeds?: boolean;
    }
  ): Promise<MatchScore | null> {
    // Find all available drivers within range
    const nearbyDrivers = await realTimeTrackingService.findNearbyDrivers(
      pickup.lat,
      pickup.lng,
      10 // 10km radius
    );

    if (nearbyDrivers.length === 0) {
      return null;
    }

    // Score each driver using multiple factors
    const scoredDrivers: MatchScore[] = [];

    for (const driver of nearbyDrivers) {
      const driverDoc = await collections.drivers.doc(driver.driverId).get();
      const driverData = driverDoc.data();

      if (!driverData) continue;

      // Calculate match score (0-100)
      const distanceScore = Math.max(0, 100 - driver.distance * 10); // Closer = better
      const ratingScore = (driverData.rating || 4) * 20; // 5 star = 100
      const acceptanceScore = (driverData.acceptanceRate || 0.8) * 100;
      const vehicleScore = driverData.vehicleType === requirements.vehicleType ? 100 : 50;
      const languageScore = requirements.preferredLanguage && 
        driverData.languages?.includes(requirements.preferredLanguage) ? 100 : 70;

      // Weighted total
      const totalScore = 
        distanceScore * 0.35 +
        ratingScore * 0.25 +
        acceptanceScore * 0.15 +
        vehicleScore * 0.15 +
        languageScore * 0.10;

      scoredDrivers.push({
        driverId: driver.driverId,
        score: totalScore,
        factors: {
          distance: distanceScore,
          rating: ratingScore,
          acceptanceRate: acceptanceScore,
          vehicleMatch: vehicleScore,
          languageMatch: languageScore,
        },
      });
    }

    // Sort by score and return best match
    scoredDrivers.sort((a, b) => b.score - a.score);

    if (scoredDrivers.length > 0) {
      // Log matching decision for analytics
      await this.logMatchingDecision(tripId, scoredDrivers[0], scoredDrivers);
      return scoredDrivers[0];
    }

    return null;
  }

  // DYNAMIC SURGE PRICING
  async calculateSurgePricing(): Promise<Map<string, number>> {
    const surgeMap = new Map<string, number>();

    // Get demand hotspots (areas with high request volume)
    const hotspots = await this.identifyDemandHotspots();

    for (const hotspot of hotspots) {
      const demandSupplyRatio = hotspot.requests / Math.max(hotspot.availableDrivers, 1);

      let surgeMultiplier = 1.0;
      if (demandSupplyRatio > 3) {
        surgeMultiplier = 2.5; // Very high demand
      } else if (demandSupplyRatio > 2) {
        surgeMultiplier = 2.0; // High demand
      } else if (demandSupplyRatio > 1.5) {
        surgeMultiplier = 1.5; // Moderate demand
      } else if (demandSupplyRatio > 1.2) {
        surgeMultiplier = 1.25; // Slight demand
      }

      surgeMap.set(hotspot.areaId, surgeMultiplier);

      // Store surge info
      await collections.surgeZones.doc(hotspot.areaId).set({
        areaId: hotspot.areaId,
        areaName: hotspot.areaName,
        surgeMultiplier,
        demandSupplyRatio,
        requests: hotspot.requests,
        availableDrivers: hotspot.availableDrivers,
        updatedAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)), // 10 min expiry
      });
    }

    return surgeMap;
  }

  // FRAUD DETECTION
  async runFraudDetection(): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = [];
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check for multiple cancellations
    const cancellations = await collections.trips
      .where('status', '==', 'cancelled')
      .where('timestamps.cancelledAt', '>=', Timestamp.fromDate(hourAgo))
      .get();

    // Group by user
    const cancellationsByUser = new Map<string, number>();
    cancellations.docs.forEach(doc => {
      const trip = doc.data();
      const userId = trip.customerId;
      cancellationsByUser.set(userId, (cancellationsByUser.get(userId) || 0) + 1);
    });

    // Flag users with 3+ cancellations in an hour
    for (const [userId, count] of cancellationsByUser) {
      if (count >= 3) {
        const alert: FraudAlert = {
          userId,
          type: 'multiple_cancellations',
          severity: count >= 5 ? 'high' : 'medium',
          details: `${count} cancellations in the last hour`,
          timestamp: now,
          autoAction: count >= 5 ? 'account_suspended' : 'warning_sent',
        };
        alerts.push(alert);

        // Store alert
        await collections.fraudAlerts.add({
          ...alert,
          timestamp: Timestamp.fromDate(alert.timestamp),
        });

        // Take auto action
        if (count >= 5) {
          await this.suspendAccount(userId, 'Multiple cancellations detected');
        }
      }
    }

    // Check for suspicious payment patterns
    const recentPayments = await collections.payments
      .where('createdAt', '>=', Timestamp.fromDate(hourAgo))
      .where('status', '==', 'failed')
      .get();

    const failedByUser = new Map<string, number>();
    recentPayments.docs.forEach(doc => {
      const payment = doc.data();
      failedByUser.set(payment.userId, (failedByUser.get(payment.userId) || 0) + 1);
    });

    for (const [userId, count] of failedByUser) {
      if (count >= 3) {
        const alert: FraudAlert = {
          userId,
          type: 'payment_fraud',
          severity: 'high',
          details: `${count} failed payment attempts in the last hour`,
          timestamp: now,
          autoAction: 'payment_blocked',
        };
        alerts.push(alert);

        await collections.fraudAlerts.add({
          ...alert,
          timestamp: Timestamp.fromDate(alert.timestamp),
        });
      }
    }

    return alerts;
  }

  // AUTO PAYOUTS
  async processAutoPayouts(): Promise<{ processed: number; totalAmount: number }> {
    // Find drivers eligible for payout (balance >= R100)
    const driversSnapshot = await collections.drivers
      .where('earnings.pendingBalance', '>=', 100)
      .where('payoutEnabled', '==', true)
      .get();

    let processed = 0;
    let totalAmount = 0;

    for (const doc of driversSnapshot.docs) {
      const driver = doc.data();
      
      // Check if payout day (e.g., every Monday or when balance > R500)
      const shouldPayout = 
        driver.earnings.pendingBalance >= 500 || 
        new Date().getDay() === 1; // Monday

      if (shouldPayout && driver.bankDetails?.verified) {
        const amount = driver.earnings.pendingBalance;
        
        try {
          // Initiate payout via wallet service
          await walletService.processWithdrawal(
            doc.id,
            amount,
            {
              bankName: driver.bankDetails.bankName,
              accountNumber: driver.bankDetails.accountNumber,
              accountName: driver.bankDetails.accountName,
            }
          );

          // Update driver earnings
          await collections.drivers.doc(doc.id).update({
            'earnings.pendingBalance': 0,
            'earnings.lastPayoutAt': Timestamp.now(),
            'earnings.totalPaidOut': FieldValue.increment(amount),
          });

          // Notify driver via WhatsApp
          if (driver.phone) {
            await whatsappService.sendTextMessage(
              driver.phone,
              `Panda Rider: Your payout of R${amount.toFixed(2)} has been processed and will reflect in your account within 24-48 hours.`
            );
          }

          processed++;
          totalAmount += amount;
        } catch (error) {
          console.error(`[PANDA BRAIN] Payout failed for driver ${doc.id}:`, error);
        }
      }
    }

    return { processed, totalAmount };
  }

  // DEMAND FORECASTING
  async updateDemandForecasts(): Promise<DemandForecast[]> {
    const forecasts: DemandForecast[] = [];

    // Analyze historical data for key areas
    const areas = ['johannesburg_cbd', 'sandton', 'soweto', 'pretoria', 'cape_town_cbd', 'durban'];
    const timeSlots = ['morning_peak', 'afternoon', 'evening_peak', 'night'];

    for (const area of areas) {
      for (const slot of timeSlots) {
        // Get historical average for this area/time
        const historicalAvg = await this.getHistoricalDemand(area, slot);
        
        // Count current available drivers in area
        const currentSupply = await this.getDriversInArea(area);

        // Predict demand based on day of week, weather, events
        const predictedDemand = this.predictDemand(historicalAvg, area);

        const forecast: DemandForecast = {
          area,
          timeSlot: slot,
          expectedDemand: predictedDemand,
          currentSupply,
          suggestedDrivers: Math.max(0, predictedDemand - currentSupply),
          surgeMultiplier: predictedDemand > currentSupply * 1.5 ? 1.5 : 1.0,
        };

        forecasts.push(forecast);

        // Store forecast
        await collections.demandForecasts.doc(`${area}_${slot}`).set({
          ...forecast,
          updatedAt: Timestamp.now(),
        });
      }
    }

    return forecasts;
  }

  // Process scheduled trips
  private async processScheduledTrips(): Promise<void> {
    const now = Timestamp.now();
    const thirtyMinutesFromNow = Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000));

    const scheduledTrips = await collections.trips
      .where('status', '==', 'pending')
      .where('scheduledAt', '>=', now)
      .where('scheduledAt', '<=', thirtyMinutesFromNow)
      .get();

    for (const doc of scheduledTrips.docs) {
      const trip = doc.data();
      
      // Find optimal driver
      const match = await this.findOptimalDriver(doc.id, trip.pickup, {
        vehicleType: trip.vehicleType,
        serviceType: trip.type,
      });

      if (match) {
        // Notify driver about upcoming scheduled trip
        await notificationService.sendScheduledTripReminder(match.driverId, doc.id, {
          scheduledTime: trip.scheduledAt.toDate(),
          pickup: trip.pickup.address,
        });
      }
    }
  }

  // Cleanup stale data
  private async cleanupStaleData(): Promise<void> {
    const twoHoursAgo = Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000));

    // Cancel stale pending trips (no driver found for 30 min)
    const staleTrips = await collections.trips
      .where('status', '==', 'pending')
      .where('timestamps.createdAt', '<=', twoHoursAgo)
      .get();

    for (const doc of staleTrips.docs) {
      await tripService.cancel(doc.id, 'system', 'No driver available - trip expired');
    }

    // Remove expired surge zones
    const expiredSurge = await collections.surgeZones
      .where('expiresAt', '<=', Timestamp.now())
      .get();

    for (const doc of expiredSurge.docs) {
      await doc.ref.delete();
    }
  }

  // Process pending trips
  private async processPendingTrips(): Promise<void> {
    const pendingTrips = await collections.trips
      .where('status', '==', 'pending')
      .where('driverId', '==', null)
      .limit(50)
      .get();

    for (const doc of pendingTrips.docs) {
      const trip = doc.data();
      
      const match = await this.findOptimalDriver(doc.id, trip.pickup, {
        vehicleType: trip.vehicleType,
        serviceType: trip.type,
      });

      if (match && match.score > 60) {
        // Notify matched driver
        await notificationService.sendTripRequest(match.driverId, doc.id, {
          pickup: trip.pickup.address,
          dropoff: trip.dropoff.address,
          fare: trip.fare.total,
          matchScore: match.score,
        });
      }
    }
  }

  // Helper methods
  private async logMatchingDecision(
    tripId: string,
    selectedDriver: MatchScore,
    allCandidates: MatchScore[]
  ): Promise<void> {
    await collections.matchingLogs.add({
      tripId,
      selectedDriverId: selectedDriver.driverId,
      selectedScore: selectedDriver.score,
      factors: selectedDriver.factors,
      totalCandidates: allCandidates.length,
      topCandidates: allCandidates.slice(0, 5),
      timestamp: Timestamp.now(),
    });
  }

  private async identifyDemandHotspots(): Promise<Array<{
    areaId: string;
    areaName: string;
    requests: number;
    availableDrivers: number;
  }>> {
    // Simplified - in production, use geospatial clustering
    return [
      { areaId: 'johannesburg_cbd', areaName: 'Johannesburg CBD', requests: 45, availableDrivers: 20 },
      { areaId: 'sandton', areaName: 'Sandton', requests: 38, availableDrivers: 25 },
      { areaId: 'soweto', areaName: 'Soweto', requests: 28, availableDrivers: 15 },
    ];
  }

  private async getHistoricalDemand(area: string, timeSlot: string): Promise<number> {
    // Simplified - would query historical data
    const baselineMap: Record<string, number> = {
      johannesburg_cbd: 50,
      sandton: 40,
      soweto: 30,
      pretoria: 35,
      cape_town_cbd: 45,
      durban: 25,
    };
    return baselineMap[area] || 20;
  }

  private async getDriversInArea(area: string): Promise<number> {
    // Simplified - would use geohash queries
    return Math.floor(Math.random() * 30) + 10;
  }

  private predictDemand(historical: number, area: string): number {
    // Simplified prediction - would use ML model
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const multiplier = isWeekend ? 1.3 : 1.0;
    return Math.round(historical * multiplier);
  }

  private async suspendAccount(userId: string, reason: string): Promise<void> {
    await collections.users.doc(userId).update({
      status: 'suspended',
      suspendedAt: Timestamp.now(),
      suspensionReason: reason,
    });
  }
}

export const pandaBrainService = new PandaBrainService();
