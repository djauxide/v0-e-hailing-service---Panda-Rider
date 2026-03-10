import { Router, Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { sendMessageSchema } from '../utils/validation';

const router = Router();

// Get messages for a trip
router.get(
  '/:tripId/messages',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const before = req.query.before as string | undefined;

      const messages = await chatService.getMessages(req.userId!, req.params.tripId, {
        limit,
        before,
      });

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Send a message
router.post(
  '/:tripId/messages',
  authenticate,
  validateBody(sendMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text, type } = req.body;
      const message = await chatService.sendMessage(
        req.userId!,
        req.params.tripId,
        text,
        type
      );

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Send quick message
router.post(
  '/:tripId/quick-message',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageKey } = req.body;
      const message = await chatService.sendQuickMessage(
        req.userId!,
        req.params.tripId,
        messageKey
      );

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Share location
router.post(
  '/:tripId/share-location',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lat, lng, address } = req.body;
      const message = await chatService.shareLocation(req.userId!, req.params.tripId, {
        lat,
        lng,
        address,
      });

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get unread count
router.get(
  '/:tripId/unread',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await chatService.getUnreadCount(req.userId!, req.params.tripId);
      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
