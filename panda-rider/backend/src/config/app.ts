export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Currency configuration - South African Rand
  currency: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // Fare configuration in ZAR (South African Rand)
  fare: {
    baseFare: {
      car: parseFloat(process.env.BASE_FARE_CAR || '45.00'),        // R45 base
      motorcycle: parseFloat(process.env.BASE_FARE_MOTORCYCLE || '27.00'), // R27 base
      bicycle: parseFloat(process.env.BASE_FARE_BICYCLE || '18.00'),      // R18 base
    },
    perKmRate: parseFloat(process.env.PER_KM_RATE || '32.40'),    // R32.40 per km
    perMinuteRate: parseFloat(process.env.PER_MINUTE_RATE || '4.50'), // R4.50 per min
    minimumFare: parseFloat(process.env.MINIMUM_FARE || '90.00'),  // R90 minimum
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
  
  // Trip configuration (ZAR rates)
  trip: {
    cancellationFeePercent: 0.1, // 10% cancellation fee
    freeWaitTimeMinutes: 5, // Free waiting time
    perMinuteWaitingRate: 9.00, // R9.00 per minute after free wait time
  },
  
  // Geohash precision levels
  geohash: {
    precision: 6, // ~1.2km accuracy
  },
};

export default appConfig;
