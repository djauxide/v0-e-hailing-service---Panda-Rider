#!/bin/bash
# Panda Rider - Quick Start Development Guide

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   PANDA RIDER - QUICK START GUIDE      ║${NC}"
echo -e "${GREEN}║   E-Hailing Platform for South Africa ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"

# Step 1: Clone Repository
echo -e "\n${BLUE}STEP 1: Clone Repository${NC}"
echo -e "${YELLOW}$ git clone https://github.com/djauxide/v0-e-hailing-service---Panda-Rider.git${NC}"
echo -e "${YELLOW}$ cd v0-e-hailing-service---Panda-Rider${NC}"

# Step 2: Setup Backend
echo -e "\n${BLUE}STEP 2: Setup Backend Server${NC}"
echo -e "${YELLOW}cd panda-rider/backend${NC}"
echo -e "${YELLOW}npm install${NC}"
echo -e "${YELLOW}cp .env.example .env${NC}"
echo -e "\n${YELLOW}Fill in .env with:${NC}"
cat << 'EOF'
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
STRIPE_SECRET_KEY=sk_test_xxxxx
GOOGLE_MAPS_API_KEY=AIzaSyDxxxxxxxx
EOF

echo -e "\n${YELLOW}npm run dev${NC}"
echo -e "${GREEN}✓ Backend running on http://localhost:3000${NC}"

# Step 3: Setup Customer App
echo -e "\n${BLUE}STEP 3: Run Customer App${NC}"
echo -e "${YELLOW}cd panda-rider/flutter-customer${NC}"
echo -e "${YELLOW}flutter pub get${NC}"
echo -e "${YELLOW}flutter run${NC}"
echo -e "${GREEN}✓ Customer app running${NC}"

# Step 4: Setup Driver App
echo -e "\n${BLUE}STEP 4: Run Driver App (in new terminal)${NC}"
echo -e "${YELLOW}cd panda-rider/flutter-driver${NC}"
echo -e "${YELLOW}flutter pub get${NC}"
echo -e "${YELLOW}flutter run${NC}"
echo -e "${GREEN}✓ Driver app running${NC}"

# Step 5: Build for Testing
echo -e "\n${BLUE}STEP 5: Build for Testing${NC}"
echo -e "${YELLOW}cd panda-rider/scripts${NC}"
echo -e "${YELLOW}chmod +x deploy-app-stores.sh${NC}"
echo -e "\n${YELLOW}For testing (Firebase App Distribution):${NC}"
echo -e "${YELLOW}./deploy-app-stores.sh test customer${NC}"
echo -e "${YELLOW}./deploy-app-stores.sh test driver${NC}"

echo -e "\n${YELLOW}For beta (Google Play/TestFlight):${NC}"
echo -e "${YELLOW}./deploy-app-stores.sh beta customer${NC}"
echo -e "${YELLOW}./deploy-app-stores.sh beta driver${NC}"

echo -e "\n${YELLOW}For production (All app stores):${NC}"
echo -e "${YELLOW}./deploy-app-stores.sh production customer${NC}"
echo -e "${YELLOW}./deploy-app-stores.sh production driver${NC}"

# Features Overview
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}FEATURES INCLUDED:${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

echo -e "\n${BLUE}🚗 Core Services:${NC}"
echo "  • Ride-hailing with real-time GPS tracking"
echo "  • Food delivery with live tracking"
echo "  • Package/Courier delivery"

echo -e "\n${BLUE}💰 Payment Gateways (All in ZAR):${NC}"
echo "  • Stripe (International cards)"
echo "  • Google Pay"
echo "  • Apple Pay"
echo "  • PayFast (South African)"
echo "  • Ozow (Instant EFT)"
echo "  • SnapScan (QR payments)"
echo "  • Panda Wallet (Internal)"
echo "  • Cash payment"

echo -e "\n${BLUE}💳 Fintech Features:${NC}"
echo "  • P2P money transfers"
echo "  • Wallet top-ups and withdrawals"
echo "  • Surge pricing display"
echo "  • WhatsApp notifications"
echo "  • Transaction history"

echo -e "\n${BLUE}🔒 Security:${NC}"
echo "  • Biometric authentication (Face ID, Fingerprint)"
echo "  • 4-digit PIN for transactions"
echo "  • Two-factor authentication"
echo "  • Session management"
echo "  • Account lockout protection"

echo -e "\n${BLUE}📊 Admin Dashboard:${NC}"
echo "  • Real-time analytics"
echo "  • Revenue reporting"
echo "  • Driver performance metrics"
echo "  • Surge pricing controls"
echo "  • User management"
echo "  • Payment gateway status"

echo -e "\n${BLUE}🤖 AI & Automation:${NC}"
echo "  • Panda Brain AI Engine (30-second cycles)"
echo "  • Intelligent driver matching"
echo "  • Dynamic surge pricing"
echo "  • Fraud detection"
echo "  • Auto payouts"

# Testing & Deployment
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}TESTING & DEPLOYMENT:${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

echo -e "\n${BLUE}🧪 Local Testing:${NC}"
echo -e "${YELLOW}./run.sh customer${NC}"
echo -e "  Runs customer app locally"
echo -e "${YELLOW}./run.sh driver${NC}"
echo -e "  Runs driver app locally"
echo -e "${YELLOW}./run.sh backend${NC}"
echo -e "  Runs backend server"

echo -e "\n${BLUE}🎮 Interactive Development:${NC}"
echo -e "${YELLOW}./run.sh all${NC}"
echo -e "  Shows menu for running different components"

echo -e "\n${BLUE}📱 App Store Deployment:${NC}"
echo "  Google Play Store: Supports 190+ countries"
echo "  Apple App Store: Supports iOS 12+"
echo "  Huawei App Gallery: Support for Huawei devices"

# Environment Setup
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}ENVIRONMENT SETUP:${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Required Accounts:${NC}"
echo "  1. Firebase Project"
echo "  2. Google Cloud Console (for Maps API)"
echo "  3. Stripe Account (for payments)"
echo "  4. Google Play Developer Account ($25)"
echo "  5. Apple Developer Program ($99/year)"
echo "  6. Huawei Developer Account (free)"

echo -e "\n${YELLOW}Environment Variables:${NC}"
echo "  Set in panda-rider/backend/.env:"
echo "  - FIREBASE_PROJECT_ID"
echo "  - FIREBASE_PRIVATE_KEY"
echo "  - FIREBASE_CLIENT_EMAIL"
echo "  - STRIPE_SECRET_KEY"
echo "  - GOOGLE_MAPS_API_KEY"

# Documentation
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}DOCUMENTATION:${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Available Guides:${NC}"
echo "  • panda-rider/docs/API.md"
echo "  • panda-rider/docs/SETUP.md"
echo "  • panda-rider/docs/ARCHITECTURE.md"
echo "  • panda-rider/docs/APP_STORE_DEPLOYMENT.md"

# Final Instructions
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}NEXT STEPS:${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}1. Set up Firebase project${NC}"
echo "   Go to https://console.firebase.google.com"

echo -e "\n${YELLOW}2. Get API keys${NC}"
echo "   - Google Maps API"
echo "   - Stripe test keys"

echo -e "\n${YELLOW}3. Configure backend${NC}"
echo "   Edit panda-rider/backend/.env"

echo -e "\n${YELLOW}4. Run locally${NC}"
echo "   ./run.sh backend"
echo "   ./run.sh customer"
echo "   ./run.sh driver"

echo -e "\n${YELLOW}5. Deploy to app stores${NC}"
echo "   ./deploy-app-stores.sh test customer"
echo "   Follow the deployment guide"

# Support
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}SUPPORT & RESOURCES:${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

echo -e "\n${BLUE}Documentation:${NC}"
echo "  https://github.com/djauxide/v0-e-hailing-service---Panda-Rider"

echo -e "\n${BLUE}Flutter:${NC}"
echo "  https://flutter.dev/docs/get-started"

echo -e "\n${BLUE}Firebase:${NC}"
echo "  https://firebase.google.com/docs"

echo -e "\n${BLUE}Google Play Console:${NC}"
echo "  https://play.google.com/console/about/gettingstarted/"

echo -e "\n${BLUE}App Store Connect:${NC}"
echo "  https://appstoreconnect.apple.com"

echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}Ready to build the future of mobility!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}\n"
