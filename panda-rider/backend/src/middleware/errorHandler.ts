import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { appConfig } from '../config/app';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    userId: req.userId,
  });

  // Handle ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && !appConfig.isProduction && { details: err.details }),
      },
    });
    return;
  }

  // Handle validation errors from Joi
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
    return;
  }

  // Handle Firebase errors
  if ((err as any).code?.startsWith('auth/')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error',
        ...(!appConfig.isProduction && { details: err.message }),
      },
    });
    return;
  }

  // Handle Stripe errors
  if ((err as any).type?.startsWith('Stripe')) {
    res.status(400).json({
      success: false,
      error: {
        code: 'PAYMENT_ERROR',
        message: 'Payment processing error',
        ...(!appConfig.isProduction && { details: err.message }),
      },
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: appConfig.isProduction ? 'An unexpected error occurred' : err.message,
      ...(!appConfig.isProduction && { stack: err.stack }),
    },
  });
}

// 404 handler
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
