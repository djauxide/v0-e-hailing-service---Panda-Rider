import { Timestamp } from 'firebase-admin/firestore';

// User Roles
export type UserRole = 'customer' | 'driver' | 'admin';

// Vehicle Types
export type VehicleType = 'car' | 'motorcycle' | 'bicycle';

// Service Types
export type ServiceType = 'ride' | 'food' | 'package';

// Trip Status
export type TripStatus = 
  | 'pending'      // Waiting for driver
  | 'accepted'     // Driver accepted
  | 'arriving'     // Driver on the way to pickup
  | 'arrived'      // Driver at pickup location
  | 'in_progress'  // Trip started
  | 'completed'    // Trip completed
  | 'cancelled';   // Trip cancelled

// Driver Status
export type DriverStatus = 'pending' | 'approved' | 'suspended' | 'rejected';

// Payment Status
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

// Payment Method Type
export type PaymentMethodType = 'card' | 'wallet' | 'cash';

// Location Interface
export interface Location {
  lat: number;
  lng: number;
  address: string;
  geohash?: string;
}

// User Interface
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  avatar?: string;
  role: UserRole;
  rating: number;
  totalTrips: number;
  wallet: {
    balance: number;
    currency: string;
  };
  savedAddresses: SavedAddress[];
  fcmToken?: string;
  stripeCustomerId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
}

// Driver Interface
export interface Driver {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  vehicleDetails: VehicleDetails;
  documents: DriverDocuments;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation?: Location;
  serviceTypes: ServiceType[];
  status: DriverStatus;
  earnings: DriverEarnings;
  rating: number;
  totalTrips: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string;
}

export interface DriverDocuments {
  license: DocumentInfo;
  insurance: DocumentInfo;
  registration: DocumentInfo;
  profilePhoto: string;
}

export interface DocumentInfo {
  url: string;
  verified: boolean;
  expiryDate?: Timestamp;
  uploadedAt: Timestamp;
}

export interface DriverEarnings {
  today: number;
  week: number;
  month: number;
  total: number;
  currency: string;
}

// Trip Interface
export interface Trip {
  id: string;
  customerId: string;
  driverId?: string;
  type: ServiceType;
  status: TripStatus;
  pickup: Location;
  dropoff: Location;
  fare: TripFare;
  payment: TripPayment;
  rating?: TripRating;
  route?: RouteInfo;
  vehicleType: VehicleType;
  scheduledAt?: Timestamp;
  timestamps: TripTimestamps;
  cancellation?: CancellationInfo;
  metadata?: Record<string, any>;
}

export interface TripFare {
  base: number;
  distance: number;
  time: number;
  surge: number;
  surgeMultiplier: number;
  waitingTime: number;
  toll: number;
  discount: number;
  total: number;
  currency: string;
}

export interface TripPayment {
  method: PaymentMethodType;
  status: PaymentStatus;
  transactionId?: string;
  paymentIntentId?: string;
  paidAt?: Timestamp;
}

export interface TripRating {
  byCustomer?: {
    rating: number;
    comment?: string;
    createdAt: Timestamp;
  };
  byDriver?: {
    rating: number;
    comment?: string;
    createdAt: Timestamp;
  };
}

export interface RouteInfo {
  polyline: string;
  distance: number; // in km
  duration: number; // in minutes
}

export interface TripTimestamps {
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
  arrivedAt?: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  cancelledAt?: Timestamp;
}

export interface CancellationInfo {
  cancelledBy: 'customer' | 'driver' | 'system';
  reason: string;
  fee: number;
}

// Food Order Interface
export interface FoodOrder {
  id: string;
  tripId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  specialInstructions?: string;
  createdAt: Timestamp;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  options?: string[];
}

// Package Delivery Interface
export interface PackageDelivery {
  id: string;
  tripId: string;
  description: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  photos: string[];
  recipientName: string;
  recipientPhone: string;
  requiresSignature: boolean;
  fragile: boolean;
  createdAt: Timestamp;
}

// Chat Message Interface
export interface ChatMessage {
  id: string;
  tripId: string;
  senderId: string;
  senderType: 'customer' | 'driver';
  text: string;
  type: 'text' | 'image' | 'location';
  read: boolean;
  createdAt: Timestamp;
}

// Payment Interface
export interface Payment {
  id: string;
  tripId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethodType;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Rating Interface
export interface Rating {
  id: string;
  tripId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment?: string;
  type: 'customer_to_driver' | 'driver_to_customer';
  createdAt: Timestamp;
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Timestamp;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// Fare Estimate Response
export interface FareEstimate {
  distance: number;
  duration: number;
  fare: TripFare;
  vehicleOptions: VehicleOption[];
}

export interface VehicleOption {
  type: VehicleType;
  fare: number;
  eta: number; // minutes
  available: boolean;
}

// Driver Location Update
export interface DriverLocationUpdate {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: Timestamp;
}

// Dashboard Stats (Admin)
export interface DashboardStats {
  totalUsers: number;
  totalDrivers: number;
  activeDrivers: number;
  totalTrips: number;
  tripsToday: number;
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  tripsByType: {
    ride: number;
    food: number;
    package: number;
  };
  tripsByStatus: Record<TripStatus, number>;
}
