import Joi from 'joi';

// Location schema
const locationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  address: Joi.string().required(),
});

// Auth Schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const phoneVerificationSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  code: Joi.string().length(6).optional(),
});

// User Schemas
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  avatar: Joi.string().uri().optional(),
});

export const addFundsSchema = Joi.object({
  amount: Joi.number().positive().min(1).max(10000).required(),
  paymentMethodId: Joi.string().required(),
});

export const savedAddressSchema = Joi.object({
  label: Joi.string().max(50).required(),
  address: Joi.string().required(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

// Driver Schemas
export const driverRegistrationSchema = Joi.object({
  vehicleType: Joi.string().valid('car', 'motorcycle', 'bicycle').required(),
  vehicleDetails: Joi.object({
    make: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().min(1990).max(new Date().getFullYear() + 1).required(),
    plate: Joi.string().required(),
    color: Joi.string().required(),
  }).required(),
  serviceTypes: Joi.array().items(Joi.string().valid('ride', 'food', 'package')).min(1).required(),
});

export const driverStatusSchema = Joi.object({
  isOnline: Joi.boolean().required(),
});

export const driverLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  heading: Joi.number().min(0).max(360).optional(),
  speed: Joi.number().min(0).optional(),
});

export const nearbyDriversSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().positive().max(50).default(5),
  vehicleType: Joi.string().valid('car', 'motorcycle', 'bicycle').optional(),
  serviceType: Joi.string().valid('ride', 'food', 'package').optional(),
});

// Trip Schemas
export const tripEstimateSchema = Joi.object({
  type: Joi.string().valid('ride', 'food', 'package').required(),
  pickup: locationSchema.required(),
  dropoff: locationSchema.required(),
  vehicleType: Joi.string().valid('car', 'motorcycle', 'bicycle').optional(),
});

export const createTripSchema = Joi.object({
  type: Joi.string().valid('ride', 'food', 'package').required(),
  pickup: locationSchema.required(),
  dropoff: locationSchema.required(),
  vehicleType: Joi.string().valid('car', 'motorcycle', 'bicycle').required(),
  paymentMethod: Joi.string().valid('card', 'wallet', 'cash').required(),
  paymentMethodId: Joi.string().when('paymentMethod', {
    is: 'card',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  scheduledAt: Joi.date().iso().min('now').optional(),
  // For food orders
  orderId: Joi.string().when('type', {
    is: 'food',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
  // For package delivery
  packageDetails: Joi.object({
    description: Joi.string().required(),
    weight: Joi.number().positive().optional(),
    recipientName: Joi.string().required(),
    recipientPhone: Joi.string().required(),
    requiresSignature: Joi.boolean().default(false),
    fragile: Joi.boolean().default(false),
  }).when('type', {
    is: 'package',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

export const cancelTripSchema = Joi.object({
  reason: Joi.string().max(500).required(),
});

// Payment Schemas
export const createPaymentIntentSchema = Joi.object({
  tripId: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

export const confirmPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
});

export const addPaymentMethodSchema = Joi.object({
  paymentMethodId: Joi.string().required(),
});

// Rating Schemas
export const submitRatingSchema = Joi.object({
  tripId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).optional(),
});

// Chat Schemas
export const sendMessageSchema = Joi.object({
  text: Joi.string().max(1000).required(),
  type: Joi.string().valid('text', 'image', 'location').default('text'),
});

// Admin Schemas
export const approveDriverSchema = Joi.object({
  approved: Joi.boolean().required(),
  reason: Joi.string().when('approved', {
    is: false,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export const suspendUserSchema = Joi.object({
  suspended: Joi.boolean().required(),
  reason: Joi.string().required(),
});

export const fareConfigSchema = Joi.object({
  baseFare: Joi.object({
    car: Joi.number().positive().optional(),
    motorcycle: Joi.number().positive().optional(),
    bicycle: Joi.number().positive().optional(),
  }).optional(),
  perKmRate: Joi.number().positive().optional(),
  perMinuteRate: Joi.number().positive().optional(),
  minimumFare: Joi.number().positive().optional(),
  surgeMultiplier: Joi.number().min(1).max(5).optional(),
});

// Pagination schema
export const paginationSchema = Joi.object({
  page: Joi.number().positive().default(1),
  limit: Joi.number().positive().max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// Validation helper function
export function validate<T>(schema: Joi.Schema, data: unknown): { value: T; error?: string } {
  const { value, error } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return { value, error: message };
  }

  return { value };
}
