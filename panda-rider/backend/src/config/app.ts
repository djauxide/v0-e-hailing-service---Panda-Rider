export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // Fare configuration
  fare: {
    baseFare: {
      car: parseFloat(process.env.BASE_FARE_CAR || '2.50'),
      motorcycle: parseFloat(process.env.BASE_FARE_MOTORCYCLE || '1.50'),
      bicycle: parseFloat(process.env.BASE_FARE_BICYCLE || '1.00'),
    },
    perKmRate: parseFloat(process.env.PER_KM_RATE || '1.80'),
    perMinuteRate: parseFloat(process.env.PER_MINUTE_RATE || '0.25'),
    minimumFare: parseFloat(process.env.MINIMUM_FARE || '5.00'),
    surgeMultiplierMax: parseFloat(process.env.SURGE_MULTIPLIER_MAX || '3.0'),
    
    // Service type multipliers
    serviceMultipliers: {
      ride: 1.0,
      food: 0.8, // Slightly cheaper for food delivery
      package: 0.9, // Slightly cheaper for packages
    },
    
    // Vehicle type multipliers
    vehicleMultipliers: {
      car: 1.0,
      motorcycle: 0.7,
      bicycle: 0.5,
    },
  },
  
  // Driver matching configuration
  matching: {
    searchRadiusKm: 5, // Initial search radius in km
    maxSearchRadiusKm: 15, // Maximum search radius
    requestTimeoutSeconds: 30, // Time for driver to accept
    maxDriversToNotify: 5, // Max drivers to notify at once
  },
  
  // Trip configuration
  trip: {
    cancellationFeePercent: 0.1, // 10% cancellation fee
    freeWaitTimeMinutes: 5, // Free waiting time
    perMinuteWaitingRate: 0.50, // Rate after free wait time
  },
  
  // Geohash precision levels
  geohash: {
    precision: 6, // ~1.2km accuracy
  },
};

export default appConfig;
