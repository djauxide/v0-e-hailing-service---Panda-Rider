# Panda Rider Setup Guide

This guide walks you through setting up the complete Panda Rider platform.

## Prerequisites

- Node.js 18+ and npm/pnpm
- Flutter SDK 3.16+
- Firebase account
- Stripe account
- Google Cloud account (for Maps API)

## 1. Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it "panda-rider" (or your preferred name)
4. Enable Google Analytics (optional)

### Enable Authentication

1. Go to Authentication > Sign-in method
2. Enable Email/Password
3. Enable Phone (requires adding a phone number for testing)

### Create Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Start in production mode
4. Select your preferred region

### Set Up Cloud Messaging

1. Go to Project Settings > Cloud Messaging
2. Note your Server Key (for backend notifications)

### Generate Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely

### Configure Flutter Apps

1. Go to Project Settings > General
2. Add Android app:
   - Package name: `com.pandarider.customer` (customer app)
   - Package name: `com.pandarider.driver` (driver app)
   - Download `google-services.json` for each
3. Add iOS app:
   - Bundle ID: `com.pandarider.customer` (customer app)
   - Bundle ID: `com.pandarider.driver` (driver app)
   - Download `GoogleService-Info.plist` for each

## 2. Google Maps Setup

### Enable APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to APIs & Services > Enable APIs
4. Enable:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Maps JavaScript API (for admin dashboard)
   - Directions API
   - Geocoding API
   - Places API

### Create API Key

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > API Key
3. Restrict the key:
   - For mobile: Restrict to Android/iOS apps
   - For backend: Restrict to your server IPs
   - For web: Restrict to your domains

## 3. Stripe Setup

### Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete account setup

### Get API Keys

1. Go to Developers > API Keys
2. Note your:
   - Publishable key (for Flutter apps)
   - Secret key (for backend)

### Set Up Webhooks

1. Go to Developers > Webhooks
2. Add endpoint: `https://your-api-domain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.created`
4. Note the Webhook signing secret

## 4. Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development

# Firebase (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...

# App Config
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Run the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Deploy Firestore Security Rules

```bash
firebase login
firebase use your-project-id
firebase deploy --only firestore:rules
```

## 5. Flutter Customer App Setup

### Install Dependencies

```bash
cd flutter-customer
flutter pub get
```

### Configure Firebase

1. Copy `google-services.json` to `android/app/`
2. Copy `GoogleService-Info.plist` to `ios/Runner/`

### Configure App Settings

Edit `lib/config/app_config.dart`:

```dart
class AppConfig {
  static const String apiBaseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  // static const String apiBaseUrl = 'http://localhost:3000/api'; // iOS simulator
  // static const String apiBaseUrl = 'https://api.pandarider.com/api'; // Production
  
  static const String googleMapsApiKey = 'AIza...';
  static const String stripePublishableKey = 'pk_test_...';
}
```

### Android Configuration

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <!-- Add permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application>
        <!-- Add Google Maps API key -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
    </application>
</manifest>
```

### iOS Configuration

Edit `ios/Runner/Info.plist`:

```xml
<dict>
    <!-- Location permissions -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Panda Rider needs your location to find nearby drivers and track your trip.</string>
    <key>NSLocationAlwaysUsageDescription</key>
    <string>Panda Rider needs your location to track your trip.</string>
    
    <!-- Google Maps -->
    <key>GMSApiKey</key>
    <string>YOUR_GOOGLE_MAPS_API_KEY</string>
</dict>
```

### Run the App

```bash
# iOS Simulator
flutter run -d ios

# Android Emulator
flutter run -d android

# Specific device
flutter devices  # List devices
flutter run -d <device_id>
```

## 6. Flutter Driver App Setup

Follow the same steps as the Customer App, but:

1. Use `flutter-driver/` directory
2. Use different package name: `com.pandarider.driver`
3. Configure background location for continuous tracking

### Additional Driver App Permissions

Android `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

iOS `Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>location</string>
</array>
```

## 7. Admin Dashboard Setup

The admin dashboard runs in v0 or can be deployed separately.

### Local Development

```bash
cd admin-dashboard
npm install
npm run dev
```

### Environment Variables

Create `.env.local`:

```env
# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL=...

# Google Maps (for live map)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Testing

### Create Test Users

1. Register a customer account through the app
2. Register a driver account through the driver app
3. Use Firebase Console to manually set admin role for an admin user

### Test Payments

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

### Test Locations

For testing without real GPS:
- Use Android Emulator's location controls
- Use iOS Simulator's Debug > Location menu
- Use Xcode's Debug > Simulate Location

## Production Checklist

- [ ] Enable Stripe live mode and update keys
- [ ] Restrict all API keys to production domains
- [ ] Set up Firebase security rules
- [ ] Configure CORS for production domains
- [ ] Set up monitoring (Firebase Crashlytics, Sentry)
- [ ] Enable SSL for all endpoints
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up logging and alerting
- [ ] Test payment flows with real cards
- [ ] Submit apps to App Store and Play Store

## Troubleshooting

### Firebase Auth Issues
- Ensure SHA-1 fingerprint is added for Android
- Check that bundle ID matches for iOS

### Google Maps Not Loading
- Verify API key restrictions
- Check that all required APIs are enabled
- Look for JavaScript console errors

### Payment Failures
- Check Stripe webhook is receiving events
- Verify webhook secret is correct
- Check Stripe dashboard for error details

### Location Not Working
- Ensure permissions are granted
- Check device location settings
- Verify Google Play Services (Android)
