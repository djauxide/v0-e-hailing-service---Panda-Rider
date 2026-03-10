import { Router, Request, Response, NextFunction } from 'express';
import { ratingService } from '../services/rating.service';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { submitRatingSchema } from '../utils/validation';

const router = Router();

// Submit rating
router.post(
  '/',
  authenticate,
  validateBody(submitRatingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId, rating, comment } = req.body;
      const result = await ratingService.submitRating(
        req.userId!,
        tripId,
        rating,
        comment
      );
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user ratings
router.get(
  '/user/:userId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const type = req.query.type as 'received' | 'given' | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const result = await ratingService.getUserRatings(req.params.userId, {
        type,
        page,
        limit,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get trip rating
router.get(
  '/trip/:tripId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rating = await ratingService.getTripRating(req.params.tripId);
      res.json({
        success: true,
        data: rating,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get driver rating stats
router.get(
  '/driver/:driverId/stats',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await ratingService.getDriverRatingStats(req.params.driverId);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
