import { db, collections } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface ReportOptions {
  startDate: Date;
  endDate: Date;
  groupBy?: 'daily' | 'weekly' | 'monthly';
  format?: 'json' | 'csv' | 'pdf';
}

export class ReportingService {
  // Generate Revenue Report
  async generateRevenueReport(options: ReportOptions): Promise<any> {
    const { startDate, endDate, groupBy = 'daily' } = options;
    
    const tripsSnapshot = await db.collection('trips')
      .where('completedAt', '>=', Timestamp.fromDate(startDate))
      .where('completedAt', '<=', Timestamp.fromDate(endDate))
      .where('status', '==', 'completed')
      .get();

    const revenueData: any[] = [];
    const grouped: { [key: string]: any } = {};

    tripsSnapshot.docs.forEach(doc => {
      const trip = doc.data();
      const timestamp = trip.completedAt.toDate();
      const key = this.getGroupKey(timestamp, groupBy);

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          revenue: 0,
          trips: 0,
          averageFare: 0,
          platformFee: 0,
          driverPayout: 0,
        };
      }

      grouped[key].revenue += trip.fare?.total || 0;
      grouped[key].platformFee += (trip.fare?.total || 0) * 0.2; // 20% platform fee
      grouped[key].driverPayout += (trip.fare?.total || 0) * 0.8;
      grouped[key].trips += 1;
    });

    Object.keys(grouped).forEach(key => {
      grouped[key].averageFare = grouped[key].revenue / grouped[key].trips;
      revenueData.push(grouped[key]);
    });

    const totals = {
      totalRevenue: revenueData.reduce((sum, r) => sum + r.revenue, 0),
      totalTrips: revenueData.reduce((sum, r) => sum + r.trips, 0),
      averageFare: 0,
      platformFee: revenueData.reduce((sum, r) => sum + r.platformFee, 0),
      driverPayout: revenueData.reduce((sum, r) => sum + r.driverPayout, 0),
    };
    totals.averageFare = totals.totalRevenue / totals.totalTrips;

    return {
      reportType: 'revenue',
      period: { startDate, endDate },
      groupBy,
      data: revenueData,
      totals,
      generatedAt: new Date(),
    };
  }

  // Generate Driver Performance Report
  async generateDriverPerformanceReport(options: ReportOptions): Promise<any> {
    const { startDate, endDate } = options;

    const driversSnapshot = await collections.drivers.get();
    const performanceData: any[] = [];

    for (const driverDoc of driversSnapshot.docs) {
      const driver = driverDoc.data();
      
      // Get trips for this driver
      const tripsSnapshot = await db.collection('trips')
        .where('driverId', '==', driverDoc.id)
        .where('completedAt', '>=', Timestamp.fromDate(startDate))
        .where('completedAt', '<=', Timestamp.fromDate(endDate))
        .where('status', '==', 'completed')
        .get();

      // Get ratings
      const ratingsSnapshot = await db.collection('ratings')
        .where('driverId', '==', driverDoc.id)
        .where('createdAt', '>=', Timestamp.fromDate(startDate))
        .where('createdAt', '<=', Timestamp.fromDate(endDate))
        .get();

      let totalRating = 0;
      ratingsSnapshot.docs.forEach(doc => {
        totalRating += doc.data().rating;
      });

      const avgRating = ratingsSnapshot.size > 0 ? totalRating / ratingsSnapshot.size : 0;
      const totalEarnings = tripsSnapshot.docs.reduce((sum, doc) => sum + ((doc.data().fare?.total || 0) * 0.8), 0);

      performanceData.push({
        driverId: driverDoc.id,
        name: driver.name,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        trips: tripsSnapshot.size,
        rating: Math.round(avgRating * 10) / 10,
        reviews: ratingsSnapshot.size,
        earnings: totalEarnings,
        acceptanceRate: driver.acceptanceRate || 0,
        cancellationRate: driver.cancellationRate || 0,
        status: driver.isOnline ? 'online' : 'offline',
      });
    }

    // Sort by earnings descending
    performanceData.sort((a, b) => b.earnings - a.earnings);

    return {
      reportType: 'driver_performance',
      period: { startDate, endDate },
      data: performanceData,
      summary: {
        totalDrivers: performanceData.length,
        activeDrivers: performanceData.filter(d => d.status === 'online').length,
        averageRating: (performanceData.reduce((sum, d) => sum + d.rating, 0) / performanceData.length).toFixed(2),
        totalEarnings: performanceData.reduce((sum, d) => sum + d.earnings, 0),
      },
      generatedAt: new Date(),
    };
  }

  // Generate User Acquisition Report
  async generateUserAcquisitionReport(options: ReportOptions): Promise<any> {
    const { startDate, endDate, groupBy = 'daily' } = options;

    const usersSnapshot = await collections.users
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('createdAt', '<=', Timestamp.fromDate(endDate))
      .get();

    const userData: any[] = [];
    const grouped: { [key: string]: any } = {};

    usersSnapshot.docs.forEach(doc => {
      const user = doc.data();
      const timestamp = user.createdAt.toDate();
      const key = this.getGroupKey(timestamp, groupBy);

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          customers: 0,
          drivers: 0,
          totalUsers: 0,
          cumulativeUsers: 0,
        };
      }

      if (user.role === 'driver') {
        grouped[key].drivers += 1;
      } else {
        grouped[key].customers += 1;
      }
      grouped[key].totalUsers += 1;
    });

    let cumulative = 0;
    Object.keys(grouped).sort().forEach(key => {
      cumulative += grouped[key].totalUsers;
      grouped[key].cumulativeUsers = cumulative;
      userData.push(grouped[key]);
    });

    return {
      reportType: 'user_acquisition',
      period: { startDate, endDate },
      groupBy,
      data: userData,
      totals: {
        newCustomers: usersSnapshot.docs.filter(d => d.data().role !== 'driver').length,
        newDrivers: usersSnapshot.docs.filter(d => d.data().role === 'driver').length,
        totalNewUsers: usersSnapshot.size,
      },
      generatedAt: new Date(),
    };
  }

  // Generate Payment Method Report
  async generatePaymentMethodReport(options: ReportOptions): Promise<any> {
    const { startDate, endDate } = options;

    const paymentsSnapshot = await db.collection('payments')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('createdAt', '<=', Timestamp.fromDate(endDate))
      .where('status', '==', 'succeeded')
      .get();

    const paymentsByMethod: { [key: string]: any } = {
      stripe: { count: 0, amount: 0 },
      google_pay: { count: 0, amount: 0 },
      apple_pay: { count: 0, amount: 0 },
      payfast: { count: 0, amount: 0 },
      ozow: { count: 0, amount: 0 },
      snapscan: { count: 0, amount: 0 },
      wallet: { count: 0, amount: 0 },
      cash: { count: 0, amount: 0 },
    };

    paymentsSnapshot.docs.forEach(doc => {
      const payment = doc.data();
      const method = payment.gateway || 'unknown';
      
      if (paymentsByMethod[method]) {
        paymentsByMethod[method].count += 1;
        paymentsByMethod[method].amount += payment.amount || 0;
      }
    });

    const data = Object.entries(paymentsByMethod).map(([method, data]) => ({
      method,
      ...data,
      percentage: (data.amount / paymentsSnapshot.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0)) * 100,
    }));

    return {
      reportType: 'payment_methods',
      period: { startDate, endDate },
      data,
      totals: {
        totalTransactions: paymentsSnapshot.size,
        totalAmount: paymentsSnapshot.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0),
      },
      generatedAt: new Date(),
    };
  }

  // Generate Fraud Detection Report
  async generateFraudDetectionReport(options: ReportOptions): Promise<any> {
    const { startDate, endDate } = options;

    const fraudAlertsSnapshot = await db.collection('fraud_alerts')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('createdAt', '<=', Timestamp.fromDate(endDate))
      .get();

    const fraudData: { [key: string]: number } = {
      multiple_cancellations: 0,
      payment_failures: 0,
      suspicious_locations: 0,
      rating_abuse: 0,
      account_abuse: 0,
    };

    fraudAlertsSnapshot.docs.forEach(doc => {
      const alert = doc.data();
      if (fraudData[alert.type] !== undefined) {
        fraudData[alert.type] += 1;
      }
    });

    return {
      reportType: 'fraud_detection',
      period: { startDate, endDate },
      data: Object.entries(fraudData).map(([type, count]) => ({
        type,
        count,
        percentage: (count / fraudAlertsSnapshot.size) * 100 || 0,
      })),
      totalAlerts: fraudAlertsSnapshot.size,
      suspendedAccounts: (await collections.users.where('status', '==', 'suspended').get()).size,
      generatedAt: new Date(),
    };
  }

  // Generate Service Area Report
  async generateServiceAreaReport(options: ReportOptions): Promise<any> {
    const { startDate, endDate } = options;

    const tripsSnapshot = await db.collection('trips')
      .where('completedAt', '>=', Timestamp.fromDate(startDate))
      .where('completedAt', '<=', Timestamp.fromDate(endDate))
      .where('status', '==', 'completed')
      .get();

    const areaData: { [key: string]: any } = {};

    tripsSnapshot.docs.forEach(doc => {
      const trip = doc.data();
      const area = trip.pickupArea || 'Unknown';

      if (!areaData[area]) {
        areaData[area] = {
          area,
          trips: 0,
          revenue: 0,
          averageFare: 0,
          drivers: new Set(),
          customers: new Set(),
        };
      }

      areaData[area].trips += 1;
      areaData[area].revenue += trip.fare?.total || 0;
      areaData[area].drivers.add(trip.driverId);
      areaData[area].customers.add(trip.customerId);
    });

    const data = Object.values(areaData).map((area: any) => ({
      area: area.area,
      trips: area.trips,
      revenue: area.revenue,
      averageFare: area.revenue / area.trips,
      uniqueDrivers: area.drivers.size,
      uniqueCustomers: area.customers.size,
    })).sort((a: any, b: any) => b.revenue - a.revenue);

    return {
      reportType: 'service_area',
      period: { startDate, endDate },
      data,
      topArea: data[0],
      generatedAt: new Date(),
    };
  }

  // Export report to CSV
  async exportToCsv(report: any): Promise<string> {
    const headers = Object.keys(report.data[0] || {});
    const csv = [headers.join(',')];

    report.data.forEach((row: any) => {
      csv.push(headers.map(h => `"${row[h]}"`).join(','));
    });

    return csv.join('\n');
  }

  // Export report to PDF (placeholder - requires pdf library)
  async exportToPdf(report: any): Promise<Buffer> {
    // In production, use a library like pdfkit or puppeteer
    return Buffer.from(JSON.stringify(report));
  }

  // Helper: Get group key for grouping
  private getGroupKey(date: Date, groupBy: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const week = this.getWeekNumber(date);

    switch (groupBy) {
      case 'daily':
        return `${year}-${month}-${day}`;
      case 'weekly':
        return `${year}-W${week}`;
      case 'monthly':
        return `${year}-${month}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  // Helper: Get ISO week number
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}

export const reportingService = new ReportingService();
