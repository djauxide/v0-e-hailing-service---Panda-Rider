// Custom API Error class
export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code: string = 'BAD_REQUEST', details?: any) {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    return new ApiError(401, code, message);
  }

  static forbidden(message: string = 'Forbidden', code: string = 'FORBIDDEN') {
    return new ApiError(403, code, message);
  }

  static notFound(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    return new ApiError(404, code, message);
  }

  static conflict(message: string, code: string = 'CONFLICT') {
    return new ApiError(409, code, message);
  }

  static tooManyRequests(message: string = 'Too many requests', code: string = 'TOO_MANY_REQUESTS') {
    return new ApiError(429, code, message);
  }

  static internal(message: string = 'Internal server error', code: string = 'INTERNAL_ERROR') {
    return new ApiError(500, code, message);
  }
}

// Error codes
export const ErrorCodes = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  PHONE_ALREADY_EXISTS: 'PHONE_ALREADY_EXISTS',

  // Driver errors
  DRIVER_NOT_FOUND: 'DRIVER_NOT_FOUND',
  DRIVER_NOT_APPROVED: 'DRIVER_NOT_APPROVED',
  DRIVER_SUSPENDED: 'DRIVER_SUSPENDED',
  DRIVER_OFFLINE: 'DRIVER_OFFLINE',
  NO_DRIVERS_AVAILABLE: 'NO_DRIVERS_AVAILABLE',
  ALREADY_REGISTERED_AS_DRIVER: 'ALREADY_REGISTERED_AS_DRIVER',

  // Trip errors
  TRIP_NOT_FOUND: 'TRIP_NOT_FOUND',
  TRIP_ALREADY_ACCEPTED: 'TRIP_ALREADY_ACCEPTED',
  TRIP_CANNOT_BE_CANCELLED: 'TRIP_CANNOT_BE_CANCELLED',
  TRIP_ALREADY_COMPLETED: 'TRIP_ALREADY_COMPLETED',
  INVALID_TRIP_STATUS: 'INVALID_TRIP_STATUS',
  TRIP_NOT_ASSIGNED_TO_DRIVER: 'TRIP_NOT_ASSIGNED_TO_DRIVER',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',

  // Rating errors
  ALREADY_RATED: 'ALREADY_RATED',
  CANNOT_RATE_OWN_TRIP: 'CANNOT_RATE_OWN_TRIP',
  TRIP_NOT_COMPLETED: 'TRIP_NOT_COMPLETED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_LOCATION: 'INVALID_LOCATION',

  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};

export default ApiError;
