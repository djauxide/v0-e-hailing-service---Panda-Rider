# Deployment Guide for Panda Rider

## Backend (Node.js + Express)

### Deploy to Vercel
```bash
cd backend
vercel deploy
```

### Environment Variables on Vercel
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `STRIPE_SECRET_KEY`
- `GOOGLE_MAPS_API_KEY`
- `JWT_SECRET`

## Flutter Apps

### Customer App
```bash
cd flutter-customer
flutter build apk  # Android
flutter build ios  # iOS
```

### Driver App
```bash
cd flutter-driver
flutter build apk  # Android
flutter build ios  # iOS
```

## Admin Dashboard

### Deploy to Vercel
```bash
cd admin-dashboard
vercel deploy
```

## Firebase Setup

1. Create Firebase project
2. Enable Firestore Database
3. Enable Cloud Storage
4. Enable Firebase Authentication
5. Create service account keys
6. Deploy Firestore security rules

## Stripe Setup

1. Create Stripe account
2. Get API keys from dashboard
3. Add to environment variables
4. Configure webhook endpoints

## GitHub Setup

1. Create GitHub repository
2. Push monorepo structure:
```bash
git init
git add .
git commit -m "Initial commit: Panda Rider multiservice e-hailing platform"
git branch -M main
git remote add origin https://github.com/yourusername/panda-rider.git
git push -u origin main
```

## CI/CD Pipeline

Create `.github/workflows/deploy.yml` for automatic deployments
