#!/bin/bash
# Panda Rider Installation & Setup Script

echo "🚀 Welcome to Panda Rider Setup"
echo "================================"

# Create .env files
echo "📝 Creating environment files..."
cp backend/.env.example backend/.env
cp flutter-customer/.env.example flutter-customer/.env
cp flutter-driver/.env.example flutter-driver/.env

echo "✅ Environment files created. Please update them with your credentials."
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with Firebase and Stripe credentials"
echo "2. Update flutter-customer/.env with API keys"
echo "3. Update flutter-driver/.env with API keys"
echo ""
echo "🚀 To run:"
echo "Backend: cd backend && npm run dev"
echo "Admin Dashboard: cd admin-dashboard && npm run dev"
echo "Flutter Customer: flutter run -d [device]"
echo "Flutter Driver: flutter run -d [device]"
echo ""
echo "✨ Happy coding!"
