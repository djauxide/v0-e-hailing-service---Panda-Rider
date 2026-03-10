import { v4 as uuidv4 } from 'uuid';
import * as geofire from 'geofire-common';
import { appConfig } from '../config/app';

// Generate unique ID
export function generateId(): string {
  return uuidv4();
}

// Generate geohash for location
export function generateGeohash(lat: number, lng: number): string {
  return geofire.geohashForLocation([lat, lng], appConfig.geohash.precision);
}

// Get geohash bounds for querying nearby locations
export function getGeohashBounds(
  lat: number,
  lng: number,
  radiusKm: number
): { geohashMin: string; geohashMax: string }[] {
  const bounds = geofire.geohashQueryBounds([lat, lng], radiusKm * 1000);
  return bounds.map(([geohashMin, geohashMax]) => ({
    geohashMin,
    geohashMax,
  }));
}

// Calculate distance between two coordinates (in km)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return geofire.distanceBetween([lat1, lng1], [lat2, lng2]);
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Round to 2 decimal places
export function roundToTwoDecimals(num: number): number {
  return Math.round(num * 100) / 100;
}

// Calculate ETA based on distance
export function calculateETA(distanceKm: number, averageSpeedKmh: number = 30): number {
  return Math.ceil((distanceKm / averageSpeedKmh) * 60); // Returns minutes
}

// Parse pagination parameters
export function parsePagination(query: any): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// Create pagination response
export function createPaginationResponse(
  total: number,
  page: number,
  limit: number
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
} {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}

// Sanitize user data for response (remove sensitive fields)
export function sanitizeUser(user: any): any {
  const { password, fcmToken, stripeCustomerId, ...sanitized } = user;
  return sanitized;
}

// Sanitize driver data for response
export function sanitizeDriver(driver: any): any {
  const { documents, ...sanitized } = driver;
  return {
    ...sanitized,
    documents: {
      license: { verified: documents?.license?.verified },
      insurance: { verified: documents?.insurance?.verified },
      registration: { verified: documents?.registration?.verified },
    },
  };
}

// Generate a random OTP
export function generateOTP(length: number = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

// Check if a timestamp is within a certain duration
export function isWithinDuration(
  timestamp: Date | any,
  durationMs: number
): boolean {
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  return Date.now() - date.getTime() < durationMs;
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters except +
  return phone.replace(/[^\d+]/g, '');
}

// Mask sensitive data (for logging)
export function maskString(str: string, visibleChars: number = 4): string {
  if (str.length <= visibleChars) return str;
  return '*'.repeat(str.length - visibleChars) + str.slice(-visibleChars);
}

// Generate trip reference number
export function generateTripReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PR-${timestamp}-${random}`;
}

// Sleep utility (for rate limiting, retries, etc.)
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry function with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await sleep(baseDelayMs * Math.pow(2, attempt));
      }
    }
  }
  
  throw lastError!;
}

// Check if coordinates are valid
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Convert Firestore Timestamp to ISO string
export function timestampToISO(timestamp: any): string {
  if (!timestamp) return '';
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return new Date(timestamp).toISOString();
}
