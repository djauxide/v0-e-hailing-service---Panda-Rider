#!/bin/bash
# Panda Rider - Full Automation Setup Script
# Flutter + Firebase + Google Cloud Integration
# Currency: South African Rand (ZAR)
# Region: South Africa

set -e

echo "========================================"
echo "  Panda Rider - Full Automation Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Flutter
    if ! command -v flutter &> /dev/null; then
        echo -e "${RED}Flutter not found. Please install Flutter first.${NC}"
        echo "Visit: https://flutter.dev/docs/get-started/install"
        exit 1
    fi
    echo -e "${GREEN}✓ Flutter installed${NC}"
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        echo -e "${YELLOW}Installing Firebase CLI...${NC}"
        npm install -g firebase-tools
    fi
    echo -e "${GREEN}✓ Firebase CLI installed${NC}"
    
    # Check gcloud CLI
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}Google Cloud SDK not found. Please install it first.${NC}"
        echo "Visit: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    echo -e "${GREEN}✓ Google Cloud SDK installed${NC}"
    
    # Check FlutterFire CLI
    if ! command -v flutterfire &> /dev/null; then
        echo -e "${YELLOW}Installing FlutterFire CLI...${NC}"
        dart pub global activate flutterfire_cli
    fi
    echo -e "${GREEN}✓ FlutterFire CLI installed${NC}"
}

# Firebase login and project setup
setup_firebase() {
    echo -e "\n${YELLOW}Setting up Firebase...${NC}"
    
    # Login to Firebase
    firebase login
    
    # Create or select project
    echo "Enter your Firebase project ID (or 'new' to create one):"
    read PROJECT_ID
    
    if [ "$PROJECT_ID" = "new" ]; then
        echo "Enter new project name:"
        read PROJECT_NAME
        firebase projects:create $PROJECT_NAME
        PROJECT_ID=$PROJECT_NAME
    fi
    
    # Set project
    firebase use $PROJECT_ID
    
    # Enable required services
    echo -e "${YELLOW}Enabling Firebase services...${NC}"
    firebase experiments:enable webframeworks
    
    echo -e "${GREEN}✓ Firebase project configured: $PROJECT_ID${NC}"
    export FIREBASE_PROJECT_ID=$PROJECT_ID
}

# Google Cloud setup
setup_gcloud() {
    echo -e "\n${YELLOW}Setting up Google Cloud...${NC}"
    
    # Login to gcloud
    gcloud auth login
    
    # Set project
    gcloud config set project $FIREBASE_PROJECT_ID
    
    # Enable required APIs
    echo -e "${YELLOW}Enabling Google Cloud APIs...${NC}"
    gcloud services enable \
        cloudfunctions.googleapis.com \
        firestore.googleapis.com \
        storage.googleapis.com \
        cloudscheduler.googleapis.com \
        cloudbuild.googleapis.com \
        run.googleapis.com \
        maps-backend.googleapis.com \
        directions-backend.googleapis.com \
        places-backend.googleapis.com \
        geocoding-backend.googleapis.com \
        firebase.googleapis.com \
        fcm.googleapis.com \
        identitytoolkit.googleapis.com
    
    echo -e "${GREEN}✓ Google Cloud APIs enabled${NC}"
}

# Configure Flutter apps
configure_flutter_apps() {
    echo -e "\n${YELLOW}Configuring Flutter apps...${NC}"
    
    # Customer app
    echo -e "${YELLOW}Configuring Customer app...${NC}"
    cd ../flutter-customer
    flutterfire configure --project=$FIREBASE_PROJECT_ID
    flutter pub get
    
    # Driver app
    echo -e "${YELLOW}Configuring Driver app...${NC}"
    cd ../flutter-driver
    flutterfire configure --project=$FIREBASE_PROJECT_ID
    flutter pub get
    
    cd ../scripts
    echo -e "${GREEN}✓ Flutter apps configured${NC}"
}

# Deploy Firebase services
deploy_firebase() {
    echo -e "\n${YELLOW}Deploying Firebase services...${NC}"
    
    cd ../backend
    
    # Deploy Firestore rules
    echo -e "${YELLOW}Deploying Firestore rules...${NC}"
    firebase deploy --only firestore:rules
    
    # Deploy Storage rules
    echo -e "${YELLOW}Deploying Storage rules...${NC}"
    firebase deploy --only storage
    
    # Deploy Cloud Functions (if any)
    if [ -d "functions" ]; then
        echo -e "${YELLOW}Deploying Cloud Functions...${NC}"
        firebase deploy --only functions
    fi
    
    cd ../scripts
    echo -e "${GREEN}✓ Firebase services deployed${NC}"
}

# Create Firebase rules
create_firebase_rules() {
    echo -e "\n${YELLOW}Creating Firebase security rules...${NC}"
    
    # Firestore rules
    cat > ../backend/firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Drivers collection
    match /drivers/{driverId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == driverId;
      allow update: if request.auth != null && 
        request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['location', 'isOnline', 'currentTripId']);
    }
    
    // Trips collection
    match /trips/{tripId} {
      allow read: if request.auth != null && 
        (resource.data.customerId == request.auth.uid || 
         resource.data.driverId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.customerId == request.auth.uid || 
         resource.data.driverId == request.auth.uid);
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Ratings collection
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Admin access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
EOF

    # Storage rules
    cat > ../backend/storage.rules << 'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /users/{userId}/profile/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Driver documents
    match /drivers/{driverId}/documents/{allPaths=**} {
      allow read: if request.auth != null && 
        (request.auth.uid == driverId || 
         firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth.uid == driverId;
    }
    
    // Trip receipts
    match /trips/{tripId}/receipts/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
EOF

    echo -e "${GREEN}✓ Firebase rules created${NC}"
}

# Create Cloud Functions
create_cloud_functions() {
    echo -e "\n${YELLOW}Creating Cloud Functions...${NC}"
    
    mkdir -p ../backend/functions
    cd ../backend/functions
    
    # Initialize functions if not exists
    if [ ! -f "package.json" ]; then
        npm init -y
        npm install firebase-functions firebase-admin stripe @googlemaps/google-maps-services-js
    fi
    
    cat > index.js << 'EOF'
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe
const stripe = new Stripe(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY);

// Trigger: New trip request - find nearby drivers
exports.onTripCreated = functions.firestore
  .document('trips/{tripId}')
  .onCreate(async (snap, context) => {
    const trip = snap.data();
    const tripId = context.params.tripId;
    
    // Find nearby online drivers
    const driversSnapshot = await db.collection('drivers')
      .where('isOnline', '==', true)
      .where('isAvailable', '==', true)
      .limit(10)
      .get();
    
    // Send push notifications to nearby drivers
    const notifications = driversSnapshot.docs.map(async (driverDoc) => {
      const driver = driverDoc.data();
      if (driver.fcmToken) {
        return admin.messaging().send({
          token: driver.fcmToken,
          notification: {
            title: 'New Ride Request',
            body: `Pickup: ${trip.pickupAddress}`,
          },
          data: {
            tripId: tripId,
            type: 'new_trip',
          },
        });
      }
    });
    
    await Promise.allSettled(notifications);
    return null;
  });

// Trigger: Trip status change - notify customer
exports.onTripUpdated = functions.firestore
  .document('trips/{tripId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Status changed
    if (before.status !== after.status) {
      const customer = await db.collection('users').doc(after.customerId).get();
      const customerData = customer.data();
      
      if (customerData?.fcmToken) {
        let title, body;
        
        switch (after.status) {
          case 'accepted':
            title = 'Driver Accepted';
            body = 'Your driver is on the way!';
            break;
          case 'arrived':
            title = 'Driver Arrived';
            body = 'Your driver has arrived at pickup location';
            break;
          case 'in_progress':
            title = 'Trip Started';
            body = 'You are now on your way to destination';
            break;
          case 'completed':
            title = 'Trip Completed';
            body = `Total fare: R${after.fare?.total || 0}`;
            break;
          case 'cancelled':
            title = 'Trip Cancelled';
            body = 'Your trip has been cancelled';
            break;
        }
        
        if (title) {
          await admin.messaging().send({
            token: customerData.fcmToken,
            notification: { title, body },
            data: { tripId: context.params.tripId, status: after.status },
          });
        }
      }
    }
    
    return null;
  });

// HTTP: Process payment
exports.processPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { tripId, paymentMethodId, amount } = data;
  
  try {
    // Get or create customer
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();
    
    let customerId = userData?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email,
        metadata: { firebaseUID: context.auth.uid },
      });
      customerId = customer.id;
      await userDoc.ref.update({ stripeCustomerId: customerId });
    }
    
    // Create payment intent (ZAR - South African Rand)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'zar',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: { tripId, userId: context.auth.uid },
    });
    
    // Record payment
    await db.collection('payments').add({
      tripId,
      userId: context.auth.uid,
      amount,
      stripePaymentId: paymentIntent.id,
      status: paymentIntent.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Update trip
    await db.collection('trips').doc(tripId).update({
      paymentStatus: 'paid',
      paymentId: paymentIntent.id,
    });
    
    return { success: true, paymentId: paymentIntent.id };
  } catch (error) {
    console.error('Payment error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// HTTP: Calculate fare (ZAR - South African Rand)
exports.calculateFare = functions.https.onCall(async (data, context) => {
  const { distance, duration, serviceType } = data;
  
  // Rates in ZAR (South African Rand)
  const rates = {
    ride: { baseFare: 45.00, perKm: 21.60, perMin: 4.50 },
    food: { baseFare: 54.00, perKm: 27.00, perMin: 2.70 },
    courier: { baseFare: 90.00, perKm: 36.00, perMin: 1.80 },
  };
  
  const rate = rates[serviceType] || rates.ride;
  
  const fare = rate.baseFare + 
    (distance / 1000 * rate.perKm) + 
    (duration / 60 * rate.perMin);
  
  const serviceFee = fare * 0.15;
  const total = fare + serviceFee;
  
  return {
    baseFare: rate.baseFare,
    distanceFare: distance / 1000 * rate.perKm,
    timeFare: duration / 60 * rate.perMin,
    serviceFee,
    total: Math.round(total * 100) / 100,
  };
});

// Scheduled: Clean up old pending trips
exports.cleanupPendingTrips = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    const fifteenMinutesAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 15 * 60 * 1000)
    );
    
    const pendingTrips = await db.collection('trips')
      .where('status', '==', 'pending')
      .where('createdAt', '<', fifteenMinutesAgo)
      .get();
    
    const batch = db.batch();
    pendingTrips.docs.forEach((doc) => {
      batch.update(doc.ref, { 
        status: 'cancelled',
        cancelReason: 'No driver available',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    
    await batch.commit();
    console.log(`Cleaned up ${pendingTrips.size} pending trips`);
    return null;
  });

// Scheduled: Calculate driver earnings daily
exports.calculateDailyEarnings = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const driversSnapshot = await db.collection('drivers').get();
    
    for (const driverDoc of driversSnapshot.docs) {
      const tripsSnapshot = await db.collection('trips')
        .where('driverId', '==', driverDoc.id)
        .where('status', '==', 'completed')
        .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .where('completedAt', '<', admin.firestore.Timestamp.fromDate(today))
        .get();
      
      let totalEarnings = 0;
      tripsSnapshot.docs.forEach((trip) => {
        const fare = trip.data().fare;
        if (fare) {
          totalEarnings += (fare.total - fare.serviceFee) * 0.80; // 80% to driver
        }
      });
      
      await db.collection('earnings').add({
        driverId: driverDoc.id,
        date: admin.firestore.Timestamp.fromDate(yesterday),
        amount: Math.round(totalEarnings * 100) / 100,
        tripsCount: tripsSnapshot.size,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    console.log(`Calculated earnings for ${driversSnapshot.size} drivers`);
    return null;
  });
EOF

    cd ../../scripts
    echo -e "${GREEN}✓ Cloud Functions created${NC}"
}

# Create GitHub Actions workflow
create_ci_cd() {
    echo -e "\n${YELLOW}Creating CI/CD workflows...${NC}"
    
    mkdir -p ../.github/workflows
    
    # Flutter CI workflow
    cat > ../.github/workflows/flutter-ci.yml << 'EOF'
name: Flutter CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'flutter-customer/**'
      - 'flutter-driver/**'
  pull_request:
    branches: [main]
    paths:
      - 'flutter-customer/**'
      - 'flutter-driver/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'
      
      - name: Get dependencies (Customer)
        run: |
          cd flutter-customer
          flutter pub get
      
      - name: Analyze (Customer)
        run: |
          cd flutter-customer
          flutter analyze
      
      - name: Test (Customer)
        run: |
          cd flutter-customer
          flutter test
      
      - name: Get dependencies (Driver)
        run: |
          cd flutter-driver
          flutter pub get
      
      - name: Analyze (Driver)
        run: |
          cd flutter-driver
          flutter analyze
      
      - name: Test (Driver)
        run: |
          cd flutter-driver
          flutter test

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'
      
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'
      
      - name: Decode keystore
        env:
          KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
        run: |
          echo $KEYSTORE_BASE64 | base64 -d > android/app/upload-keystore.jks
      
      - name: Build Customer APK
        env:
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
          STORE_PASSWORD: ${{ secrets.STORE_PASSWORD }}
        run: |
          cd flutter-customer
          flutter build apk --release
      
      - name: Build Driver APK
        env:
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
          STORE_PASSWORD: ${{ secrets.STORE_PASSWORD }}
        run: |
          cd flutter-driver
          flutter build apk --release
      
      - name: Upload Customer APK
        uses: actions/upload-artifact@v4
        with:
          name: customer-app-release
          path: flutter-customer/build/app/outputs/flutter-apk/app-release.apk
      
      - name: Upload Driver APK
        uses: actions/upload-artifact@v4
        with:
          name: driver-app-release
          path: flutter-driver/build/app/outputs/flutter-apk/app-release.apk

  build-ios:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'
      
      - name: Build Customer iOS
        run: |
          cd flutter-customer
          flutter build ios --release --no-codesign
      
      - name: Build Driver iOS
        run: |
          cd flutter-driver
          flutter build ios --release --no-codesign

  deploy-firebase:
    needs: [build-android, build-ios]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Download Customer APK
        uses: actions/download-artifact@v4
        with:
          name: customer-app-release
          path: ./customer-apk
      
      - name: Download Driver APK
        uses: actions/download-artifact@v4
        with:
          name: driver-app-release
          path: ./driver-apk
      
      - name: Deploy to Firebase App Distribution
        uses: wzieba/Firebase-Distribution-Github-Action@v1
        with:
          appId: ${{ secrets.FIREBASE_CUSTOMER_APP_ID }}
          serviceCredentialsFileContent: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          groups: testers
          file: ./customer-apk/app-release.apk
      
      - name: Deploy Driver to Firebase App Distribution
        uses: wzieba/Firebase-Distribution-Github-Action@v1
        with:
          appId: ${{ secrets.FIREBASE_DRIVER_APP_ID }}
          serviceCredentialsFileContent: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          groups: testers
          file: ./driver-apk/app-release.apk
EOF

    # Backend deploy workflow
    cat > ../.github/workflows/backend-deploy.yml << 'EOF'
name: Backend Deploy

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Deploy to Firebase Functions
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
      
      - name: Deploy Firestore Rules
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only firestore:rules
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
      
      - name: Deploy Storage Rules
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only storage
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
EOF

    echo -e "${GREEN}✓ CI/CD workflows created${NC}"
}

# Create Firebase config for Flutter
create_flutter_firebase_config() {
    echo -e "\n${YELLOW}Creating Flutter Firebase configurations...${NC}"
    
    # firebase.json
    cat > ../firebase.json << 'EOF'
{
  "firestore": {
    "rules": "backend/firestore.rules",
    "indexes": "backend/firestore.indexes.json"
  },
  "storage": {
    "rules": "backend/storage.rules"
  },
  "functions": {
    "source": "backend/functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run lint"
    ]
  },
  "hosting": {
    "public": "admin-dashboard/out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true
    }
  }
}
EOF

    # Firestore indexes
    cat > ../backend/firestore.indexes.json << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "driverId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "drivers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isOnline", "order": "ASCENDING" },
        { "fieldPath": "isAvailable", "order": "ASCENDING" },
        { "fieldPath": "location", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "earnings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "driverId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF

    echo -e "${GREEN}✓ Flutter Firebase configurations created${NC}"
}

# Main execution
main() {
    echo ""
    check_prerequisites
    setup_firebase
    setup_gcloud
    create_firebase_rules
    create_cloud_functions
    create_flutter_firebase_config
    configure_flutter_apps
    create_ci_cd
    deploy_firebase
    
    echo ""
    echo -e "${GREEN}========================================"
    echo "  Setup Complete!"
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo "1. Add secrets to GitHub repository:"
    echo "   - FIREBASE_SERVICE_ACCOUNT"
    echo "   - FIREBASE_CUSTOMER_APP_ID"
    echo "   - FIREBASE_DRIVER_APP_ID"
    echo "   - KEYSTORE_BASE64"
    echo "   - KEY_ALIAS, KEY_PASSWORD, STORE_PASSWORD"
    echo ""
    echo "2. Configure Stripe:"
    echo "   firebase functions:config:set stripe.secret_key=\"sk_live_xxx\""
    echo ""
    echo "3. Test locally:"
    echo "   firebase emulators:start"
    echo ""
    echo "4. Build apps:"
    echo "   cd flutter-customer && flutter run"
    echo "   cd flutter-driver && flutter run"
    echo -e "${NC}"
}

main "$@"
