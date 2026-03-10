import { Router, Request, Response, NextFunction } from 'express';
import { collections } from '../config/firebase';
import { driverService } from '../services/driver.service';
import { notificationService } from '../services/notification.service';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { approveDriverSchema, suspendUserSchema } from '../utils/validation';
import { Timestamp } from 'firebase-admin/firestore';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Get dashboard stats
router.get(
  '/dashboard-stats',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get counts
      const [usersSnapshot, driversSnapshot, tripsSnapshot] = await Promise.all([
        collections.users.get(),
        collections.drivers.get(),
        collections.trips.get(),
      ]);

      // Count active drivers
      const activeDrivers = driversSnapshot.docs.filter(
        (doc) => doc.data().isOnline === true
      ).length;

      // Get today's trips
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const todayTripsSnapshot = await collections.trips
        .where('timestamps.createdAt', '>=', todayTimestamp)
        .get();

      // Calculate revenue (simplified - just sum of completed trips)
      const completedTrips = tripsSnapshot.docs.filter(
        (doc) => doc.data().status === 'completed'
      );

      let totalRevenue = 0;
      let todayRevenue = 0;

      completedTrips.forEach((doc) => {
        const trip = doc.data();
        totalRevenue += trip.fare?.total || 0;

        const createdAt = trip.timestamps?.createdAt?.toDate();
        if (createdAt && createdAt >= today) {
          todayRevenue += trip.fare?.total || 0;
        }
      });

      // Trips by type
      const tripsByType = { ride: 0, food: 0, package: 0 };
      tripsSnapshot.docs.forEach((doc) => {
        const type = doc.data().type;
        if (type && tripsByType.hasOwnProperty(type)) {
          tripsByType[type as keyof typeof tripsByType]++;
        }
      });

      // Trips by status
      const tripsByStatus: Record<string, number> = {};
      tripsSnapshot.docs.forEach((doc) => {
        const status = doc.data().status;
        tripsByStatus[status] = (tripsByStatus[status] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          totalUsers: usersSnapshot.size,
          totalDrivers: driversSnapshot.size,
          activeDrivers,
          totalTrips: tripsSnapshot.size,
          tripsToday: todayTripsSnapshot.size,
          revenue: {
            today: todayRevenue,
            total: totalRevenue,
          },
          tripsByType,
          tripsByStatus,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all users
router.get(
  '/users',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const offset = (page - 1) * limit;

      let query = collections.users.orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      const total = snapshot.size;

      const users = snapshot.docs.slice(offset, offset + limit).map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Remove sensitive fields
        stripeCustomerId: undefined,
        fcmToken: undefined,
      }));

      res.json({
        success: true,
        data: users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all drivers
router.get(
  '/drivers',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await driverService.getAll({ status: status as any, page, limit });

      res.json({
        success: true,
        data: result.drivers,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Approve/reject driver
router.put(
  '/drivers/:id/approve',
  validateBody(approveDriverSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { approved, reason } = req.body;
      const driver = await driverService.approve(req.params.id, approved, reason);

      // Send notification
      if (approved) {
        await notificationService.sendDriverApproved(driver.userId);
      } else {
        await notificationService.sendDriverRejected(driver.userId, reason);
      }

      res.json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Suspend driver
router.put(
  '/drivers/:id/suspend',
  validateBody(suspendUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = req.body;
      const driver = await driverService.suspend(req.params.id, reason);

      res.json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Suspend user
router.put(
  '/users/:id/suspend',
  validateBody(suspendUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { suspended, reason } = req.body;

      await collections.users.doc(req.params.id).update({
        suspended,
        suspensionReason: suspended ? reason : null,
        updatedAt: Timestamp.now(),
      });

      res.json({
        success: true,
        message: suspended ? 'User suspended' : 'User unsuspended',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all trips
router.get(
  '/trips',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const offset = (page - 1) * limit;

      let query = collections.trips.orderBy('timestamps.createdAt', 'desc');

      if (req.query.status) {
        query = query.where('status', '==', req.query.status);
      }

      if (req.query.type) {
        query = query.where('type', '==', req.query.type);
      }

      const snapshot = await query.get();
      const total = snapshot.size;

      const trips = snapshot.docs
        .slice(offset, offset + limit)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      res.json({
        success: true,
        data: trips,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single trip details
router.get(
  '/trips/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tripDoc = await collections.trips.doc(req.params.id).get();

      if (!tripDoc.exists) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Trip not found' },
        });
      }

      const trip = { id: tripDoc.id, ...tripDoc.data() };

      // Get customer and driver details
      const [customerDoc, driverDoc] = await Promise.all([
        collections.users.doc(trip.customerId).get(),
        trip.driverId ? collections.drivers.doc(trip.driverId).get() : null,
      ]);

      res.json({
        success: true,
        data: {
          ...trip,
          customer: customerDoc.exists ? { id: customerDoc.id, ...customerDoc.data() } : null,
          driver: driverDoc?.exists ? { id: driverDoc.id, ...driverDoc.data() } : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
