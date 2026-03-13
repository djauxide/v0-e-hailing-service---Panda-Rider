#!/bin/bash
# Panda Rider - Quick Deploy Script

set -e

echo "Deploying Panda Rider..."

# Deploy Firebase backend
echo "Deploying Firebase services..."
firebase deploy --only firestore:rules,storage,functions

# Build and deploy admin dashboard
echo "Building admin dashboard..."
cd ../admin-dashboard
npm run build
firebase deploy --only hosting

echo "Deploy complete!"
echo "Admin Dashboard: https://$FIREBASE_PROJECT_ID.web.app"
