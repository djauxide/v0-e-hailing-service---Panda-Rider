# Panda Rider API Documentation

Base URL: `https://api.pandarider.com` or `http://localhost:3000` for development

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "token": "firebase_id_token"
  }
}
```

#### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

### Users

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "John Updated",
  "phone": "+1234567890",
  "avatar": "https://..."
}
```

#### Get Wallet Balance
```http
GET /api/users/wallet
Authorization: Bearer <token>
```

#### Add Funds to Wallet
```http
POST /api/users/add-funds
Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 50.00,
  "paymentMethodId": "pm_xxx"
}
```

---

### Drivers

#### Register as Driver
```http
POST /api/drivers/register
Authorization: Bearer <token>
```

**Body:**
```json
{
  "vehicleType": "car",
  "vehicleDetails": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "plate": "ABC123",
    "color": "Black"
  },
  "serviceTypes": ["ride", "package"]
}
```

#### Update Driver Status
```http
PUT /api/drivers/status
Authorization: Bearer <token>
```

**Body:**
```json
{
  "isOnline": true
}
```

#### Update Driver Location
```http
PUT /api/drivers/location
Authorization: Bearer <token>
```

**Body:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060
}
```

#### Get Nearby Drivers
```http
GET /api/drivers/nearby?lat=40.7128&lng=-74.0060&radius=5&vehicleType=car
Authorization: Bearer <token>
```

#### Get Driver Earnings
```http
GET /api/drivers/earnings?period=week
Authorization: Bearer <token>
```

---

### Trips

#### Get Fare Estimate
```http
POST /api/trips/estimate
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "ride",
  "pickup": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Main St, New York"
  },
  "dropoff": {
    "lat": 40.7580,
    "lng": -73.9855,
    "address": "Times Square, New York"
  },
  "vehicleType": "car"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "distance": 5.2,
    "duration": 15,
    "fare": {
      "base": 2.50,
      "distance": 10.40,
      "time": 3.75,
      "surge": 1.0,
      "total": 16.65
    },
    "vehicleOptions": [
      { "type": "car", "fare": 16.65, "eta": 3 },
      { "type": "motorcycle", "fare": 10.50, "eta": 5 }
    ]
  }
}
```

#### Create Trip
```http
POST /api/trips/create
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "ride",
  "pickup": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Main St, New York"
  },
  "dropoff": {
    "lat": 40.7580,
    "lng": -73.9855,
    "address": "Times Square, New York"
  },
  "vehicleType": "car",
  "paymentMethod": "card",
  "paymentMethodId": "pm_xxx"
}
```

#### Accept Trip (Driver)
```http
PUT /api/trips/:id/accept
Authorization: Bearer <token>
```

#### Update Trip Status
```http
PUT /api/trips/:id/arrive
PUT /api/trips/:id/start
PUT /api/trips/:id/complete
PUT /api/trips/:id/cancel
Authorization: Bearer <token>
```

#### Get Trip Details
```http
GET /api/trips/:id
Authorization: Bearer <token>
```

#### Get Trip History
```http
GET /api/trips/history?page=1&limit=20
Authorization: Bearer <token>
```

---

### Payments

#### Create Payment Intent
```http
POST /api/payments/create-intent
Authorization: Bearer <token>
```

**Body:**
```json
{
  "tripId": "trip_id",
  "amount": 16.65
}
```

#### Confirm Payment
```http
POST /api/payments/confirm
Authorization: Bearer <token>
```

**Body:**
```json
{
  "paymentIntentId": "pi_xxx"
}
```

#### Get Payment Methods
```http
GET /api/payments/methods
Authorization: Bearer <token>
```

#### Add Payment Method
```http
POST /api/payments/add-method
Authorization: Bearer <token>
```

**Body:**
```json
{
  "paymentMethodId": "pm_xxx"
}
```

---

### Ratings

#### Submit Rating
```http
POST /api/ratings/submit
Authorization: Bearer <token>
```

**Body:**
```json
{
  "tripId": "trip_id",
  "rating": 5,
  "comment": "Great driver, very professional!"
}
```

#### Get Driver Ratings
```http
GET /api/ratings/driver/:driverId
```

---

### Chat

#### Get Chat Messages
```http
GET /api/chat/:tripId/messages
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/chat/:tripId/send
Authorization: Bearer <token>
```

**Body:**
```json
{
  "text": "I'm at the main entrance",
  "type": "text"
}
```

---

### Admin Endpoints

All admin endpoints require admin role.

#### Get Dashboard Stats
```http
GET /api/admin/dashboard-stats
Authorization: Bearer <admin_token>
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=20&search=john
Authorization: Bearer <admin_token>
```

#### Get All Drivers
```http
GET /api/admin/drivers?status=pending
Authorization: Bearer <admin_token>
```

#### Approve Driver
```http
PUT /api/admin/drivers/:id/approve
Authorization: Bearer <admin_token>
```

#### Suspend User
```http
PUT /api/admin/users/:id/suspend
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "reason": "Violation of terms of service"
}
```

#### Get All Trips
```http
GET /api/admin/trips?status=completed&type=ride&from=2024-01-01&to=2024-01-31
Authorization: Bearer <admin_token>
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `DRIVER_NOT_AVAILABLE` | 400 | No drivers available |
| `TRIP_ALREADY_ACCEPTED` | 400 | Trip already taken |
| `PAYMENT_FAILED` | 400 | Payment processing failed |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Webhooks

### Stripe Webhook
```http
POST /api/webhooks/stripe
```

Handles payment events from Stripe.

### Firebase Cloud Functions

Real-time updates are handled through Firebase listeners, not webhooks.

---

## Rate Limiting

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints
- Location updates: 1 request per second per driver
