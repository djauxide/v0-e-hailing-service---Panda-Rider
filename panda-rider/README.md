# Panda Rider - Multi-Service E-Hailing Platform

A comprehensive e-hailing service supporting ride-hailing, food delivery, and package courier services.

## Project Structure

```
panda-rider/
├── backend/                 # Node.js + Express API Server
├── flutter-customer/        # Customer Mobile App (Flutter)
├── flutter-driver/          # Driver Mobile App (Flutter)
├── admin-dashboard/         # Admin Panel (Next.js) - Runs in v0
└── docs/                    # Documentation
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend API | Node.js + Express.js |
| Database & Auth | Firebase (Firestore, Auth, Storage, FCM) |
| Customer App | Flutter |
| Driver App | Flutter |
| Admin Dashboard | Next.js 16 + shadcn/ui |
| Payments | Stripe |
| Maps | Google Maps |
| Real-time | Firebase Realtime Database |

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Add your Firebase and Stripe credentials
npm run dev
```

### Flutter Apps

```bash
# Customer App
cd flutter-customer
flutter pub get
flutter run

# Driver App
cd flutter-driver
flutter pub get
flutter run
```

### Admin Dashboard

The admin dashboard runs directly in v0 or can be deployed to Vercel.

## Features

### Customer App
- Request rides, food delivery, or package courier
- Real-time driver tracking with Google Maps
- In-app payments with Stripe
- Chat with driver during trips
- Rate and review drivers
- Trip history and receipts

### Driver App
- Go online/offline toggle
- Accept/decline trip requests
- Turn-by-turn navigation
- Earnings dashboard
- Document management
- Heat map of high-demand areas

### Admin Dashboard
- Real-time trip monitoring
- User and driver management
- Revenue analytics
- Fare configuration
- Dispute resolution
- Promotion management

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

## Setup Guide

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system architecture details.

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |

### Flutter Apps

Configure in `lib/config/app_config.dart`:
- Firebase configuration
- Google Maps API key
- Backend API URL

## License

MIT License - See LICENSE file for details.
