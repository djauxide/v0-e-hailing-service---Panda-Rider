import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { appConfig } from './config/app';
import { logger, morganStream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import driverRoutes from './routes/driver.routes';
import tripRoutes from './routes/trip.routes';
import paymentRoutes from './routes/payment.routes';
import ratingRoutes from './routes/rating.routes';
import chatRoutes from './routes/chat.routes';
import adminRoutes from './routes/admin.routes';
import walletRoutes from './routes/wallet.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import reportingRoutes from './routes/reporting.routes';

// Import services
import { pandaBrainService } from './services/panda-brain.service';
import { realTimeTrackingService } from './services/realtime-tracking.service';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: appConfig.cors.origins,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later',
    },
  },
});
app.use('/api', limiter);

// Body parsing - raw for Stripe webhooks
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { stream: morganStream }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/reporting', reportingRoutes);

// Panda Brain status endpoint
app.get('/api/panda-brain/status', (req, res) => {
  const status = pandaBrainService.getStatus();
  res.json({
    success: true,
    data: status,
  });
});

// Panda Brain control endpoints (admin only)
app.post('/api/panda-brain/start', async (req, res) => {
  const result = await pandaBrainService.start();
  res.json({ success: true, data: result });
});

app.post('/api/panda-brain/stop', async (req, res) => {
  await pandaBrainService.stop();
  res.json({ success: true, message: 'Panda Brain stopped' });
});

// Real-time tracking endpoints
app.post('/api/tracking/location', async (req, res) => {
  try {
    const result = await realTimeTrackingService.updateDriverLocation(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/tracking/trip/:tripId', async (req, res) => {
  try {
    const data = await realTimeTrackingService.getLiveTripData(req.params.tripId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/tracking/nearby-drivers', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const drivers = await realTimeTrackingService.findNearbyDrivers(
      parseFloat(lat as string),
      parseFloat(lng as string),
      radius ? parseFloat(radius as string) : undefined
    );
    res.json({ success: true, data: drivers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = appConfig.port;

app.listen(PORT, async () => {
  logger.info(`Panda Rider API server running on port ${PORT}`);
  logger.info(`Environment: ${appConfig.nodeEnv}`);
  logger.info(`Currency: ZAR (South African Rand)`);
  
  // Start Panda Brain AI Engine
  logger.info('[PANDA BRAIN] Initializing AI automation engine...');
  const brainStatus = await pandaBrainService.start();
  logger.info(`[PANDA BRAIN] ${brainStatus.message}`);
});

export default app;
