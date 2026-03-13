# Panda Rider - App Store Deployment Guide

## Overview

This guide covers deploying the Panda Rider platform to:
- **Google Play Store** (Android)
- **Apple App Store** (iOS)
- **Huawei App Gallery** (Android/China)

All apps support ZAR currency for South Africa with real-time GPS tracking, WhatsApp integration, and biometric authentication.

---

## Prerequisites

### System Requirements
- macOS 12+ (for iOS builds)
- Android SDK 31+ 
- Flutter 3.10+
- Java Development Kit (JDK) 11+
- Xcode 14+ (for iOS)
- Android Studio

### Tools Installation
```bash
# Install Flutter
curl -L https://github.com/flutter/flutter/releases/download/latest-stable/flutter_linux_x64.tar.xz | tar xJ

# Install Fastlane (for deployment automation)
sudo gem install fastlane -NV

# Install Firebase CLI
npm install -g firebase-tools

# Android SDK
# Use Android Studio or sdkmanager to install SDK 31+
```

### Developer Accounts
- Google Play Developer Console account ($25 one-time)
- Apple Developer Program ($99/year)
- Huawei App Gallery account (free)

---

## Building Applications

### 1. Build Debug APKs (Testing)

```bash
cd panda-rider/scripts
chmod +x run.sh
./run.sh customer debug    # Customer app
./run.sh driver debug      # Driver app
```

Or use the deployment script:
```bash
chmod +x deploy-app-stores.sh
./deploy-app-stores.sh test customer   # Test build
./deploy-app-stores.sh test driver     # Test build
```

**Output:**
- Customer: `panda-rider/flutter-customer/build/app/outputs/flutter-apk/app-debug.apk`
- Driver: `panda-rider/flutter-driver/build/app/outputs/flutter-apk/app-debug.apk`

### 2. Build Release APKs (Google Play)

```bash
./deploy-app-stores.sh beta customer
./deploy-app-stores.sh beta driver
```

**Output:**
- Customer APK: `panda-rider/flutter-customer/build/app/outputs/flutter-apk/app-release.apk`
- Driver APK: `panda-rider/flutter-driver/build/app/outputs/flutter-apk/app-release.apk`
- Customer AAB: `panda-rider/flutter-customer/build/app/outputs/bundle/release/app-release.aab`
- Driver AAB: `panda-rider/flutter-driver/build/app/outputs/bundle/release/app-release.aab`

### 3. Build iOS Apps

```bash
./deploy-app-stores.sh beta customer   # Builds iOS for testflight
./deploy-app-stores.sh beta driver
```

Requires:
- Xcode with iOS deployment target 12.0+
- Apple development certificate and provisioning profile

---

## Deployment Process

### Google Play Store

#### Step 1: Create App Entry
1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Enter app name: "Panda Rider" (customer) or "Panda Rider Driver"
4. Select "Apps"
5. Accept declaration and click "Create"

#### Step 2: App Details
1. Fill in app description (supports multiple languages)
2. Add screenshots (1080x1920 for phones)
3. Add feature graphic (1024x500)
4. Set category as "Transportation"
5. Set content rating

#### Step 3: Upload Build

**For Testing (Internal Track):**
```bash
./deploy-app-stores.sh test customer
# Upload build/app/outputs/flutter-apk/app-debug.apk
```

**For Beta:**
1. Go to "Release" > "App releases" > "Managed beta"
2. Click "Create new release"
3. Upload `app-release.aab`
4. Add release notes
5. Review and release

**For Production:**
1. Go to "Release" > "Production"
2. Same process as beta
3. Submit for review (24-48 hours)

#### Step 4: Configure App Settings
- Pricing: Free
- Target countries: South Africa
- Supported languages: English
- Content rating questionnaire: Complete it

#### Step 5: Add Testers
```bash
firebase appdistribution:distribute build/app/outputs/flutter-apk/app-debug.apk \
  --app [FIREBASE_APP_ID] \
  --groups testers \
  --release-notes "Beta testing build"
```

---

### Apple App Store

#### Step 1: Create App Entry
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps"
3. Click "+" to create new app
4. Select platform: iOS
5. Fill in app details:
   - **App Name:** Panda Rider (Customer) / Panda Rider Driver
   - **Bundle ID:** com.pandarider.customer / com.pandarider.driver
   - **SKU:** PANDARIDER001
   - **Select user access:** Full Access

#### Step 2: Configure Version
1. Go to "TestFlight" section
2. Click "+ Add Build"
3. Select build from Xcode

#### Step 3: App Store Information
1. Screenshot details (in both portrait and landscape)
2. App icon (1024x1024 for App Store)
3. Category: Navigation/Transportation
4. Keywords: ride, delivery, transport
5. Description: "Reliable e-hailing service for rides, food, and courier"
6. Support and privacy URLs

#### Step 4: Build & Upload
```bash
# Build archive in Xcode
open panda-rider/flutter-customer/ios/Runner.xcworkspace

# Or use Flutter
flutter build ios --release -t lib/main.dart

# Upload via Xcode Organizer or transporter
```

#### Step 5: Submit for Review
1. Go to "App Store" > "Prepare for submission"
2. Choose version to submit
3. Add release notes
4. Select "Manual release" or "Automatic after approval"
5. Submit for review

**Apple typically reviews in 1-2 days**

---

### Huawei App Gallery

#### Step 1: Create App Entry
1. Go to [Huawei AppGallery Connect](https://appgallery.cloud.huawei.com)
2. Click "Create app"
3. Fill in app name: "Panda Rider"
4. Set default language
5. Select app category: Tools/Navigation

#### Step 2: Upload APK
```bash
./deploy-app-stores.sh beta customer   # Builds APK
```

1. Go to "Testing Release" > "Release"
2. Click "Upload APK"
3. Upload `build/app/outputs/flutter-apk/app-release.apk`
4. Huawei auto-extracts AAB from APK

#### Step 3: App Information
1. Add app icon (512x512)
2. Add screenshots (540x960)
3. Add description
4. Set price: Free
5. Select countries: South Africa and others

#### Step 4: Review
- Huawei review takes 2-4 hours
- No personal data collection needed (our app doesn't collect PII)
- Submit for review

---

## Testing Before Deployment

### Device Testing

**On Physical Android Device:**
```bash
# Connect device via USB
adb devices

# Install debug APK
adb install panda-rider/flutter-customer/build/app/outputs/flutter-apk/app-debug.apk

# View logs
flutter logs -v
```

**On Physical iOS Device:**
```bash
# Connect device
flutter devices

# Run app
flutter run -t lib/main.dart
```

### Firebase App Distribution Testing

```bash
# Build and distribute
firebase appdistribution:distribute build/app/outputs/flutter-apk/app-debug.apk \
  --app [FIREBASE_APP_ID] \
  --testers "tester1@example.com,tester2@example.com" \
  --release-notes "Testing build $(date +%Y-%m-%d)"
```

Testers receive email with download link.

### Testing Checklist
- [ ] Authentication (manual + biometric + OTP)
- [ ] Ride booking and GPS tracking
- [ ] Payment methods (all 7 gateways)
- [ ] P2P money transfers
- [ ] WhatsApp notifications
- [ ] Real-time driver location
- [ ] Wallet top-ups and withdrawals
- [ ] Surge pricing display
- [ ] Trip history and ratings
- [ ] Push notifications

---

## Troubleshooting

### Common Build Issues

**"Flutter not found"**
```bash
export PATH="$PATH:$HOME/flutter/bin"
flutter --version
```

**"Android SDK not found"**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**"Could not find Google Play services"**
```bash
cd panda-rider/flutter-customer
flutter pub get
flutter clean
flutter pub get
```

**iOS Build Fails**
```bash
cd panda-rider/flutter-customer/ios
pod install --repo-update
```

### APK Signing Issues

**Generate signing key:**
```bash
keytool -genkey -v -keystore ~/.android/panda_rider_key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias panda_rider_key
```

**Configure gradle:**
```
# android/key.properties
storePassword=<password>
keyPassword=<password>
keyAlias=panda_rider_key
storeFile=/path/to/panda_rider_key.jks
```

---

## Version Management

### Update Version for New Release

```bash
# Update pubspec.yaml
version: 1.0.0+1    # version+build_number

# Increment before each release
# v1.0.0 = version
# +1 = build number (must increment for each store submission)
```

### Release Notes Format

```
Version 1.0.0 Release Notes:

Features:
- Multi-service booking (Ride, Food, Courier)
- Real-time GPS tracking with live driver location
- 7 payment methods (Stripe, Google Pay, Apple Pay, PayFast, Ozow, SnapScan, Wallet)
- P2P money transfers with WhatsApp notifications
- Biometric and PIN security options
- Comprehensive trip history and ratings

Bug Fixes:
- Fixed GPS accuracy issues in high-rise areas
- Improved payment gateway fallback
- Enhanced location permissions handling

Performance:
- 40% faster app startup
- 30% reduced memory usage
- Optimized real-time tracking
```

---

## Post-Launch Monitoring

### Track Performance
- Daily active users
- Crash rate
- Ratings and reviews
- Payment conversion rate
- Driver acceptance rate

### Analytics Endpoints
```
Google Play Console → Acquire → Ratings & Reviews
App Store Connect → Sales and Trends
Huawei AppGallery Connect → Dashboard → Statistics
```

### Continuous Updates
- Monitor user feedback
- Fix reported bugs
- Add new features quarterly
- Update for OS changes
- Security patches monthly

---

## Support & Resources

- **Flutter Deployment:** https://flutter.dev/docs/deployment/android
- **Google Play Console:** https://play.google.com/console
- **App Store Connect:** https://appstoreconnect.apple.com
- **Huawei AppGallery:** https://appgallery.cloud.huawei.com
- **Firebase App Distribution:** https://firebase.google.com/docs/app-distribution

