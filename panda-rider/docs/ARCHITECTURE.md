# Panda Rider System Architecture

## Overview

Panda Rider is a multi-service e-hailing platform consisting of:

1. **Customer Mobile App** (Flutter) - For booking rides, food, and packages
2. **Driver Mobile App** (Flutter) - For accepting and completing trips
3. **Backend API** (Node.js) - REST API server
4. **Admin Dashboard** (Next.js) - Management and analytics
5. **Firebase Services** - Auth, Database, Storage, Messaging

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│  Customer App   │   Driver App    │      Admin Dashboard            │
│   (Flutter)     │   (Flutter)     │        (Next.js)                │
└────────┬────────┴────────┬────────┴──────────────┬──────────────────┘
         │                 │                        │
         │     HTTPS/WSS   │                        │
         ▼                 ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                                   │
│                   (Node.js + Express)                               │
├─────────────────────────────────────────────────────────────────────┤
│  Auth      │  Users     │  Trips     │  Payments  │  Admin          │
│  Routes    │  Routes    │  Routes    │  Routes    │  Routes         │
└─────┬──────┴─────┬──────┴─────┬──────┴─────┬──────┴──────┬──────────┘
      │            │            │            │             │
      ▼            ▼            ▼            ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVICES LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Auth      │  User      │  Trip      │  Payment   │  Notification   │
│  Service   │  Service   │  Service   │  Service   │  Service        │
├────────────┴────────────┴────────────┴────────────┴─────────────────┤
│  Matching Service  │  Fare Calculator  │  Location Service          │
└────────┬───────────┴────────┬─────────┴────────────┬────────────────┘
         │                    │                       │
         ▼                    ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│    Firebase     │     Stripe      │         Google Maps             │
│  (Auth, DB,     │   (Payments)    │   (Geocoding, Directions)       │
│   Storage, FCM) │                 │                                 │
└─────────────────┴─────────────────┴─────────────────────────────────┘
```

## Component Details

### 1. Customer Mobile App (Flutter)

**Architecture Pattern:** Provider + Repository Pattern

```
lib/
├── config/              # App configuration, constants
├── models/              # Data models (User, Trip, etc.)
├── providers/           # State management (ChangeNotifier)
├── repositories/        # Data access layer
├── screens/             # UI screens
├── services/            # API, Firebase, Location services
├── widgets/             # Reusable UI components
└── main.dart
```

**Key Features:**
- Service selection (Ride, Food, Package)
- Location search and selection
- Real-time driver tracking
- In-app payments
- Chat with driver
- Trip history

### 2. Driver Mobile App (Flutter)

**Architecture Pattern:** Provider + Repository Pattern

```
lib/
├── config/
├── models/
├── providers/
├── repositories/
├── screens/
├── services/
│   └── background_location_service.dart  # Continuous tracking
├── widgets/
└── main.dart
```

**Key Features:**
- Online/offline toggle
- Trip request handling
- Navigation integration
- Earnings tracking
- Document management
- Background location updates

### 3. Backend API (Node.js)

**Architecture Pattern:** MVC with Service Layer

```
src/
├── config/              # Firebase, Stripe, app config
├── controllers/         # Request handlers
├── middleware/          # Auth, validation, error handling
├── models/              # Firestore data models
├── routes/              # API route definitions
├── services/            # Business logic
│   ├── auth.service.js
│   ├── user.service.js
│   ├── trip.service.js
│   ├── payment.service.js
│   ├── matching.service.js
│   ├── fare.service.js
│   └── notification.service.js
└── utils/               # Helper functions
```

### 4. Admin Dashboard (Next.js)

**Architecture Pattern:** App Router with Server Components

```
app/
├── (auth)/              # Auth routes (login)
├── (dashboard)/         # Protected dashboard routes
│   ├── dashboard/       # Overview
│   ├── users/           # User management
│   ├── drivers/         # Driver management
│   ├── trips/           # Trip monitoring
│   ├── finance/         # Revenue & payments
│   └── settings/        # Configuration
├── api/                 # API routes
└── layout.tsx
```

## Data Flow

### Trip Booking Flow

```
Customer App                 Backend                    Driver App
     │                          │                           │
     │  1. Request estimate     │                           │
     │─────────────────────────>│                           │
     │                          │                           │
     │  2. Return fare options  │                           │
     │<─────────────────────────│                           │
     │                          │                           │
     │  3. Create trip          │                           │
     │─────────────────────────>│                           │
     │                          │  4. Find nearby drivers   │
     │                          │───────────────────────────>
     │                          │                           │
     │                          │  5. Push notification     │
     │                          │──────────────────────────>│
     │                          │                           │
     │                          │  6. Accept trip           │
     │                          │<──────────────────────────│
     │  7. Trip accepted        │                           │
     │<─────────────────────────│                           │
     │                          │                           │
     │  8. Real-time location   │  8. Send location         │
     │<═════════════════════════╪═══════════════════════════│
     │    (Firebase Realtime)   │                           │
     │                          │                           │
     │  9. Complete trip        │                           │
     │─────────────────────────>│<──────────────────────────│
     │                          │                           │
     │  10. Process payment     │                           │
     │<─────────────────────────│                           │
```

### Payment Flow

```
Customer App              Backend                 Stripe
     │                       │                       │
     │  1. Create intent     │                       │
     │──────────────────────>│                       │
     │                       │  2. Create PI         │
     │                       │──────────────────────>│
     │                       │  3. Return client_secret
     │                       │<──────────────────────│
     │  4. Return secret     │                       │
     │<──────────────────────│                       │
     │                       │                       │
     │  5. Confirm payment   │                       │
     │──────────────────────>│                       │
     │                       │  6. Confirm PI        │
     │                       │──────────────────────>│
     │                       │  7. Payment result    │
     │                       │<──────────────────────│
     │  8. Success/fail      │                       │
     │<──────────────────────│                       │
     │                       │                       │
     │                       │  9. Webhook event     │
     │                       │<──────────────────────│
     │                       │  10. Update DB        │
```

## Database Schema

### Collections

```
Firestore
├── users/
│   └── {userId}
│       ├── email, phone, name, avatar
│       ├── role: "customer" | "driver" | "admin"
│       ├── rating, totalTrips
│       ├── wallet: { balance, currency }
│       ├── savedAddresses: []
│       ├── paymentMethods: []
│       └── fcmToken
│
├── drivers/
│   └── {driverId}
│       ├── userId (ref)
│       ├── vehicleType, vehicleDetails
│       ├── documents: { license, insurance }
│       ├── isOnline, isAvailable
│       ├── currentLocation: { lat, lng, geohash }
│       ├── serviceTypes: []
│       ├── status: "pending" | "approved" | "suspended"
│       └── earnings: { today, week, total }
│
├── trips/
│   └── {tripId}
│       ├── customerId, driverId
│       ├── type: "ride" | "food" | "package"
│       ├── status
│       ├── pickup, dropoff (addresses)
│       ├── fare: { base, distance, time, surge, total }
│       ├── payment: { method, status, transactionId }
│       ├── rating: { byCustomer, byDriver }
│       └── timestamps
│
├── orders/
│   └── {orderId}
│       ├── tripId (ref)
│       ├── restaurantId, items
│       └── totals
│
├── packages/
│   └── {packageId}
│       ├── tripId (ref)
│       ├── description, photos
│       └── recipient info
│
├── chats/
│   └── {tripId}/messages/{messageId}
│
└── payments/
    └── {paymentId}
```

### Geospatial Queries

Driver location queries use **geohash** for efficient nearby driver searches:

```javascript
// Geohash provides O(log n) query performance
// Precision 6 = ~1.2km accuracy

const nearbyDrivers = await db.collection('drivers')
  .where('isOnline', '==', true)
  .where('isAvailable', '==', true)
  .where('geohash', '>=', geohashMin)
  .where('geohash', '<=', geohashMax)
  .get();
```

## Security

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Drivers collection
    match /drivers/{driverId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.userId;
    }
    
    // Trips - readable by participants
    match /trips/{tripId} {
      allow read: if request.auth.uid == resource.data.customerId
                  || request.auth.uid == resource.data.driverId;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.customerId
                    || request.auth.uid == resource.data.driverId;
    }
    
    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### API Security

1. **Authentication:** Firebase ID token verification
2. **Authorization:** Role-based access control
3. **Rate Limiting:** Express rate limiter
4. **Input Validation:** Joi/Zod schemas
5. **CORS:** Restricted origins
6. **HTTPS:** TLS encryption

## Scalability

### Horizontal Scaling

- Backend API is stateless, can run multiple instances
- Firebase handles database scaling automatically
- Use load balancer for multiple API servers

### Caching

```javascript
// Redis for frequently accessed data
const cachedDrivers = await redis.get('nearby_drivers_' + geohash);
if (cachedDrivers) return JSON.parse(cachedDrivers);
```

### Performance Optimizations

1. **Geohash indexing** for O(log n) location queries
2. **Pagination** for list endpoints
3. **Firestore compound indexes** for complex queries
4. **CDN** for static assets (avatars, images)
5. **Connection pooling** for database connections

## Monitoring & Observability

### Logging

```javascript
// Structured logging
logger.info('Trip created', {
  tripId,
  customerId,
  type,
  timestamp: new Date()
});
```

### Metrics

- Trip completion rate
- Average wait time
- Payment success rate
- Driver utilization
- API response times

### Alerting

- High error rates
- Payment failures
- Service outages
- Abnormal trip patterns

## Deployment

### Development
- Local Node.js server
- Firebase Emulator Suite
- Flutter simulators/emulators

### Staging
- Vercel Preview (Next.js)
- Firebase staging project
- TestFlight/Internal testing

### Production
- Vercel (Admin Dashboard)
- Cloud Run / App Engine (Backend)
- Firebase production project
- App Store / Play Store
