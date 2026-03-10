import { Router, Request, Response, NextFunction } from 'express';
import { tripService } from '../services/trip.service';
import { fareService } from '../services/fare.service';
import { driverService } from '../services/driver.service';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { tripEstimateSchema, createTripSchema, cancelTripSchema } from '../utils/validation';
import { ApiError, ErrorCodes } from '../utils/errors';

const router = Router();

// Get fare estimate
router.post(
  '/estimate',
  authenticate,
  validateBody(tripEstimateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, pickup, dropoff, vehicleType } = req.body;
      const estimate = await fareService.calculateEstimate(
        { lat: pickup.lat, lng: pickup.lng },
        { lat: dropoff.lat, lng: dropoff.lng },
        type,
        vehicleType
      );
      res.json({
        success: true,
        data: estimate,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create trip
router.post(
  '/',
  authenticate,
  validateBody(createTripSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trip = await tripService.create(req.userId!, req.body);
      res.status(201).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get trip by ID
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trip = await tripService.getById(req.params.id);
      if (!trip) {
        throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
      }

      // Check authorization
      if (trip.customerId !== req.userId && trip.driverId !== req.userId) {
        throw ApiError.forbidden('Not authorized to view this trip');
      }

      res.json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Accept trip (driver)
router.put(
  '/:id/accept',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get driver ID
      const driver = await driverService.getByUserId(req.userId!);
      if (!driver) {
        throw ApiError.forbidden('Only drivers can accept trips');
      }

      const trip = await tripService.accept(req.params.id, driver.id);
      res.json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update trip status - Arriving
router.put(
  '/:id/arriving',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trip = await tripService.getById(req.params.id);
      if (!trip) {
        throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
      }

      const driver = await driverService.getByUserId(req.userId!);
      if (!driver || trip.driverId !== driver.id) {
        throw ApiError.forbidden('Not authorized');
      }

      const updatedTrip = await tripService.updateStatus(req.params.id, 'arriving');
      res.json({
        success: true,
        data: updatedTrip,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update trip status - Arrived
router.put(
  '/:id/arrive',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trip = await tripService.getById(req.params.id);
      if (!trip) {
        throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
      }

      const driver = await driverService.getByUserId(req.userId!);
      if (!driver || trip.driverId !== driver.id) {
        throw ApiError.forbidden('Not authorized');
      }

      const updatedTrip = await tripService.updateStatus(req.params.id, 'arrived');
      res.json({
        success: true,
        data: updatedTrip,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Start trip
router.put(
  '/:id/start',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trip = await tripService.getById(req.params.id);
      if (!trip) {
        throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
      }

      const driver = await driverService.getByUserId(req.userId!);
      if (!driver || trip.driverId !== driver.id) {
        throw ApiError.forbidden('Not authorized');
      }

      const updatedTrip = await tripService.updateStatus(req.params.id, 'in_progress');
      res.json({
        success: true,
        data: updatedTrip,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Complete trip
router.put(
  '/:id/complete',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trip = await tripService.getById(req.params.id);
      if (!trip) {
        throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
      }

      const driver = await driverService.getByUserId(req.userId!);
      if (!driver || trip.driverId !== driver.id) {
        throw ApiError.forbidden('Not authorized');
      }

      const updatedTrip = await tripService.updateStatus(req.params.id, 'completed');
      res.json({
        success: true,
        data: updatedTrip,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Cancel trip
router.put(
  '/:id/cancel',
  authenticate,
  validateBody(cancelTripSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trip = await tripService.getById(req.params.id);
      if (!trip) {
        throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
      }

      let cancelledBy: 'customer' | 'driver';
      if (trip.customerId === req.userId) {
        cancelledBy = 'customer';
      } else {
        const driver = await driverService.getByUserId(req.userId!);
        if (driver && trip.driverId === driver.id) {
          cancelledBy = 'driver';
        } else {
          throw ApiError.forbidden('Not authorized to cancel this trip');
        }
      }

      const updatedTrip = await tripService.cancel(
        req.params.id,
        cancelledBy,
        req.body.reason
      );
      res.json({
        success: true,
        data: updatedTrip,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get trip history
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role === 'driver' ? 'driver' : 'customer';
      const { status, type, page, limit } = req.query;

      const result = await tripService.getHistory(req.userId!, role, {
        status: status as any,
        type: type as any,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: result.trips,
        pagination: {
          total: result.total,
          page: page ? parseInt(page as string, 10) : 1,
          limit: limit ? parseInt(limit as string, 10) : 20,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get active trips
router.get(
  '/active',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role === 'driver' ? 'driver' : 'customer';
      const trips = await tripService.getActiveTrips(req.userId!, role);
      res.json({
        success: true,
        data: trips,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
