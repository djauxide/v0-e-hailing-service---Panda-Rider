import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { registerSchema, updateProfileSchema, addFundsSchema, savedAddressSchema } from '../utils/validation';
import { sanitizeUser } from '../utils/helpers';

const router = Router();

// Register
router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: {
          user: sanitizeUser(user),
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        data: sanitizeUser(req.user),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update profile
router.put(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.updateProfile(req.userId!, req.body);
      res.json({
        success: true,
        data: sanitizeUser(user),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update FCM token
router.put(
  '/fcm-token',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.updateFcmToken(req.userId!, req.body.token);
      res.json({
        success: true,
        message: 'FCM token updated',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get wallet
router.get(
  '/wallet',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wallet = await authService.getWallet(req.userId!);
      res.json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Add funds to wallet
router.post(
  '/wallet/add-funds',
  authenticate,
  validateBody(addFundsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.addFunds(
        req.userId!,
        req.body.amount,
        req.body.paymentMethodId
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Add saved address
router.post(
  '/addresses',
  authenticate,
  validateBody(savedAddressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.addSavedAddress(req.userId!, req.body);
      res.status(201).json({
        success: true,
        message: 'Address saved',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Remove saved address
router.delete(
  '/addresses/:addressId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.removeSavedAddress(req.userId!, req.params.addressId);
      res.json({
        success: true,
        message: 'Address removed',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
