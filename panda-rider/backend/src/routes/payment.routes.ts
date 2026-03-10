import { Router, Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  addPaymentMethodSchema,
} from '../utils/validation';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../config/stripe';
import { logger } from '../utils/logger';

const router = Router();

// Create payment intent
router.post(
  '/create-intent',
  authenticate,
  validateBody(createPaymentIntentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId, amount } = req.body;
      const result = await paymentService.createPaymentIntent(
        req.userId!,
        tripId,
        amount
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

// Confirm payment
router.post(
  '/confirm',
  authenticate,
  validateBody(confirmPaymentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await paymentService.confirmPayment(req.body.paymentIntentId);
      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get payment methods
router.get(
  '/methods',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const methods = await paymentService.getPaymentMethods(req.userId!);
      res.json({
        success: true,
        data: methods,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Add payment method
router.post(
  '/methods',
  authenticate,
  validateBody(addPaymentMethodSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await paymentService.addPaymentMethod(req.userId!, req.body.paymentMethodId);
      res.status(201).json({
        success: true,
        message: 'Payment method added',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Remove payment method
router.delete(
  '/methods/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await paymentService.removePaymentMethod(req.userId!, req.params.id);
      res.json({
        success: true,
        message: 'Payment method removed',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Set default payment method
router.put(
  '/methods/:id/default',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await paymentService.setDefaultPaymentMethod(req.userId!, req.params.id);
      res.json({
        success: true,
        message: 'Default payment method updated',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Stripe webhook
router.post(
  '/webhook',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        logger.error('Webhook signature verification failed', { error: err.message });
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      await paymentService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
