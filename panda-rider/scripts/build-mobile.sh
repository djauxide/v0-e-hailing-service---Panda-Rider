#!/bin/bash
# Panda Rider - Mobile App Build Script

set -e

echo "========================================"
echo "  Building Panda Rider Mobile Apps"
echo "========================================"

BUILD_TYPE=${1:-debug}

# Build Customer App
echo ""
echo "Building Customer App ($BUILD_TYPE)..."
cd ../flutter-customer
flutter clean
flutter pub get

if [ "$BUILD_TYPE" = "release" ]; then
    # Android
    echo "Building Android APK..."
    flutter build apk --release
    echo "APK: build/app/outputs/flutter-apk/app-release.apk"
    
    # Android App Bundle
    echo "Building Android App Bundle..."
    flutter build appbundle --release
    echo "AAB: build/app/outputs/bundle/release/app-release.aab"
    
    # iOS
    echo "Building iOS..."
    flutter build ios --release
    echo "iOS build complete"
else
    flutter build apk --debug
    echo "Debug APK: build/app/outputs/flutter-apk/app-debug.apk"
fi

# Build Driver App
echo ""
echo "Building Driver App ($BUILD_TYPE)..."
cd ../flutter-driver
flutter clean
flutter pub get

if [ "$BUILD_TYPE" = "release" ]; then
    # Android
    echo "Building Android APK..."
    flutter build apk --release
    echo "APK: build/app/outputs/flutter-apk/app-release.apk"
    
    # Android App Bundle
    echo "Building Android App Bundle..."
    flutter build appbundle --release
    echo "AAB: build/app/outputs/bundle/release/app-release.aab"
    
    # iOS
    echo "Building iOS..."
    flutter build ios --release
    echo "iOS build complete"
else
    flutter build apk --debug
    echo "Debug APK: build/app/outputs/flutter-apk/app-debug.apk"
fi

echo ""
echo "========================================"
echo "  Build Complete!"
echo "========================================"
echo ""
echo "Customer App APK: flutter-customer/build/app/outputs/flutter-apk/"
echo "Driver App APK:   flutter-driver/build/app/outputs/flutter-apk/"
echo ""
echo "To distribute via Firebase App Distribution:"
echo "  firebase appdistribution:distribute <apk-path> --app <app-id> --groups testers"
