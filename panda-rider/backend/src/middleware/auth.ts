import { Request, Response, NextFunction } from 'express';
import { auth, collections } from '../config/firebase';
import { ApiError, ErrorCodes } from '../utils/errors';
import { User, UserRole } from '../models/types';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

// Verify Firebase ID token
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided', ErrorCodes.TOKEN_INVALID);
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      throw ApiError.unauthorized('No token provided', ErrorCodes.TOKEN_INVALID);
    }

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user data from Firestore
    const userDoc = await collections.users.doc(userId).get();

    if (!userDoc.exists) {
      throw ApiError.unauthorized('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    const userData = userDoc.data() as User;
    
    req.user = { ...userData, id: userId };
    req.userId = userId;

    next();
  } catch (error: any) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error.code === 'auth/id-token-expired') {
      next(ApiError.unauthorized('Token expired', ErrorCodes.TOKEN_EXPIRED));
    } else if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-revoked') {
      next(ApiError.unauthorized('Invalid token', ErrorCodes.TOKEN_INVALID));
    } else {
      next(ApiError.internal('Authentication failed'));
    }
  }
}

// Optional authentication (doesn't fail if no token)
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return next();
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userDoc = await collections.users.doc(userId).get();

    if (userDoc.exists) {
      const userData = userDoc.data() as User;
      req.user = { ...userData, id: userId };
      req.userId = userId;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

// Require specific role(s)
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access denied. Required role: ${roles.join(' or ')}`));
    }

    next();
  };
}

// Require admin role
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }

  next();
}

// Require driver role
export function requireDriver(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.role !== 'driver') {
    return next(ApiError.forbidden('Driver access required'));
  }

  next();
}

// Require customer role
export function requireCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.role !== 'customer') {
    return next(ApiError.forbidden('Customer access required'));
  }

  next();
}
