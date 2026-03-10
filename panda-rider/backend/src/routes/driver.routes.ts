import { Router, Request, Response, NextFunction } from 'express';
import { driverService } from '../services/driver.service';
import { authenticate, requireDriver } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  driverRegistrationSchema,
  driverStatusSchema,
  driverLocationSchema,
  nearbyDriversSchema,
} from '../utils/validation';
import { sanitizeDriver } from '../utils/helpers';

const router = Router();

// Register as driver
router.post(
  '/register',
  authenticate,
  validateBody(driverRegistrationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driver = await driverService.register(req.userId!, req.body);
      res.status(201).json({
        success: true,
        data: sanitizeDriver(driver),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current driver profile
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driver = await driverService.getByUserId(req.userId!);
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Not registered as a driver' },
        });
      }
      res.json({
        success: true,
        data: sanitizeDriver(driver),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update online status
router.put(
  '/status',
  authenticate,
  validateBody(driverStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driver = await driverService.getByUserId(req.userId!);
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Not registered as a driver' },
        });
      }
      const updatedDriver = await driverService.updateStatus(
        driver.id,
        req.body.isOnline
      );
      res.json({
        success: true,
        data: sanitizeDriver(updatedDriver),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update location
router.put(
  '/location',
  authenticate,
  validateBody(driverLocationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driver = await driverService.getByUserId(req.userId!);
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Not registered as a driver' },
        });
      }
      await driverService.updateLocation(driver.id, req.body);
      res.json({
        success: true,
        message: 'Location updated',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get nearby drivers (for customers)
router.get(
  '/nearby',
  authenticate,
  validateQuery(nearbyDriversSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lat, lng, radius, vehicleType, serviceType } = req.query as any;
      const drivers = await driverService.findNearby(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius),
        { vehicleType, serviceType }
      );
      res.json({
        success: true,
        data: drivers.map((d) => ({
          id: d.id,
          vehicleType: d.vehicleType,
          vehicleDetails: d.vehicleDetails,
          rating: d.rating,
          distance: d.distance,
          currentLocation: d.currentLocation,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get earnings
router.get(
  '/earnings',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driver = await driverService.getByUserId(req.userId!);
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Not registered as a driver' },
        });
      }
      const period = req.query.period as 'today' | 'week' | 'month' | 'all' | undefined;
      const earnings = await driverService.getEarnings(driver.id, period);
      res.json({
        success: true,
        data: earnings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload document
router.post(
  '/documents/:type',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driver = await driverService.getByUserId(req.userId!);
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Not registered as a driver' },
        });
      }
      const docType = req.params.type as 'license' | 'insurance' | 'registration' | 'profilePhoto';
      const { url, expiryDate } = req.body;
      await driverService.uploadDocument(
        driver.id,
        docType,
        url,
        expiryDate ? new Date(expiryDate) : undefined
      );
      res.json({
        success: true,
        message: 'Document uploaded',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
