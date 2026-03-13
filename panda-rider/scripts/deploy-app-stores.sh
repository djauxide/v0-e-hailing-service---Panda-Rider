#!/bin/bash
# Panda Rider - App Store Deployment Script
# Builds and deploys to Google Play, Apple App Store, and Huawei App Store
# Currency: South African Rand (ZAR)

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Panda Rider"
PACKAGE_NAME_CUSTOMER="com.pandarider.customer"
PACKAGE_NAME_DRIVER="com.pandarider.driver"
APP_NAME_CUSTOMER="Panda Rider"
APP_NAME_DRIVER="Panda Rider Driver"

# Deployment type: test, beta, or production
DEPLOY_TYPE=${1:-test}
APP_TYPE=${2:-customer} # customer or driver

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}  $PROJECT_NAME - App Store Deployment${NC}"
echo -e "${GREEN}  Deployment Type: $DEPLOY_TYPE${NC}"
echo -e "${GREEN}  App Type: $APP_TYPE${NC}"
echo -e "${GREEN}=======================================${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "\n${YELLOW}Checking prerequisites...${NC}"
    
    if ! command -v flutter &> /dev/null; then
        echo -e "${RED}❌ Flutter is not installed${NC}"
        exit 1
    fi
    
    if ! command -v java &> /dev/null; then
        echo -e "${RED}❌ Java is not installed${NC}"
        exit 1
    fi
    
    if [ "$APP_TYPE" = "customer" ] || [ "$APP_TYPE" = "both" ]; then
        if ! command -v xcode-select &> /dev/null && [ "$(uname)" = "Darwin" ]; then
            echo -e "${YELLOW}⚠️  Xcode command line tools may not be installed${NC}"
        fi
    fi
    
    echo -e "${GREEN}✓ Prerequisites check complete${NC}"
}

# Increment version code
increment_version_code() {
    local file=$1
    local current=$(grep -oP 'versionCode = \K[0-9]+' "$file" || echo "1")
    local new=$((current + 1))
    sed -i '' "s/versionCode = $current/versionCode = $new/" "$file"
    echo $new
}

# Build Android APK for Google Play Testing
build_android_test() {
    local app_path=$1
    local app_name=$2
    
    echo -e "\n${YELLOW}Building Android Debug APK for Testing...${NC}"
    cd "$app_path"
    
    flutter clean
    flutter pub get
    
    flutter build apk \
        --debug \
        --verbose \
        -t lib/main.dart
    
    if [ -f "build/app/outputs/flutter-apk/app-debug.apk" ]; then
        echo -e "${GREEN}✓ Debug APK built successfully${NC}"
        echo "Location: $app_path/build/app/outputs/flutter-apk/app-debug.apk"
    fi
}

# Build Android Release APK for Google Play
build_android_release() {
    local app_path=$1
    local app_name=$2
    
    echo -e "\n${YELLOW}Building Android Release APK for Google Play...${NC}"
    cd "$app_path"
    
    flutter clean
    flutter pub get
    
    flutter build apk \
        --release \
        --verbose \
        -t lib/main.dart
    
    if [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
        echo -e "${GREEN}✓ Release APK built successfully${NC}"
        echo "Location: $app_path/build/app/outputs/flutter-apk/app-release.apk"
    fi
}

# Build Android App Bundle for Google Play Store
build_aab() {
    local app_path=$1
    local app_name=$2
    
    echo -e "\n${YELLOW}Building Android App Bundle (AAB) for Google Play Store...${NC}"
    cd "$app_path"
    
    flutter clean
    flutter pub get
    
    flutter build appbundle \
        --release \
        --verbose \
        -t lib/main.dart
    
    if [ -f "build/app/outputs/bundle/release/app-release.aab" ]; then
        echo -e "${GREEN}✓ AAB built successfully${NC}"
        echo "Location: $app_path/build/app/outputs/bundle/release/app-release.aab"
    fi
}

# Build Huawei App Bundle (HAB)
build_hab() {
    local app_path=$1
    local app_name=$2
    
    echo -e "\n${YELLOW}Building Huawei App Bundle (HAB)...${NC}"
    cd "$app_path"
    
    flutter clean
    flutter pub get
    
    # Build release APK that can be converted to HAB
    flutter build apk \
        --release \
        --verbose \
        -t lib/main.dart \
        --split-per-abi
    
    if [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
        echo -e "${GREEN}✓ APKs built for Huawei conversion${NC}"
        echo "Use Huawei AppGallery Connect to upload and convert"
    fi
}

# Build iOS
build_ios() {
    local app_path=$1
    local app_name=$2
    local build_type=${3:-release}
    
    echo -e "\n${YELLOW}Building iOS ($build_type)...${NC}"
    cd "$app_path"
    
    flutter clean
    flutter pub get
    
    if [ "$build_type" = "release" ]; then
        flutter build ios \
            --release \
            --verbose \
            -t lib/main.dart \
            --no-codesign
    else
        flutter build ios \
            --debug \
            --verbose \
            -t lib/main.dart \
            --no-codesign
    fi
    
    echo -e "${GREEN}✓ iOS build complete${NC}"
    echo "Location: $app_path/build/ios"
}

# Upload to Firebase App Distribution (Testing)
upload_firebase_distribution() {
    local app_path=$1
    local app_name=$2
    local app_id=$3
    
    echo -e "\n${YELLOW}Uploading to Firebase App Distribution...${NC}"
    
    if ! command -v firebase &> /dev/null; then
        echo -e "${RED}❌ Firebase CLI is not installed${NC}"
        echo "Install with: npm install -g firebase-tools"
        return 1
    fi
    
    cd "$app_path"
    
    APK_PATH="build/app/outputs/flutter-apk/app-release.apk"
    
    if [ ! -f "$APK_PATH" ]; then
        echo -e "${RED}❌ APK not found at $APK_PATH${NC}"
        return 1
    fi
    
    firebase appdistribution:distribute "$APK_PATH" \
        --app "$app_id" \
        --groups testers \
        --release-notes "Testing build - $(date '+%Y-%m-%d %H:%M:%S')"
    
    echo -e "${GREEN}✓ Uploaded to Firebase App Distribution${NC}"
}

# Deploy to Google Play Console (Internal/Beta/Production)
deploy_google_play() {
    local app_path=$1
    local package_name=$2
    local track=$3 # internal, alpha, beta, production
    
    echo -e "\n${YELLOW}Deploying to Google Play Console ($track)...${NC}"
    
    # This requires fastlane or direct Play Console API
    # Using fastlane for simplicity
    
    if ! command -v fastlane &> /dev/null; then
        echo -e "${RED}❌ Fastlane is not installed${NC}"
        echo "Install with: sudo gem install fastlane"
        return 1
    fi
    
    cd "$app_path"
    
    AAB_PATH="build/app/outputs/bundle/release/app-release.aab"
    
    if [ ! -f "$AAB_PATH" ]; then
        echo -e "${RED}❌ AAB not found at $AAB_PATH${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ Google Play Console deployment ready${NC}"
    echo "Use fastlane or Play Console UI to upload: $AAB_PATH"
}

# Deploy to Apple App Store
deploy_app_store() {
    local app_path=$1
    local app_name=$2
    
    echo -e "\n${YELLOW}Preparing for Apple App Store deployment...${NC}"
    
    cd "$app_path"
    
    if ! command -v xcodebuild &> /dev/null; then
        echo -e "${RED}❌ Xcode is not available${NC}"
        return 1
    fi
    
    # Archive for App Store
    flutter build ios --release -t lib/main.dart --no-codesign
    
    echo -e "${GREEN}✓ iOS build prepared for App Store${NC}"
    echo "Use Xcode Organizer to sign and upload to App Store"
    echo "Location: build/ios"
}

# Deploy to Huawei App Gallery
deploy_huawei_gallery() {
    local app_path=$1
    local app_name=$2
    
    echo -e "\n${YELLOW}Preparing for Huawei App Gallery deployment...${NC}"
    
    cd "$app_path"
    
    # Build release APKs for Huawei
    flutter build apk --release -t lib/main.dart
    
    echo -e "${GREEN}✓ APK prepared for Huawei App Gallery${NC}"
    echo "Use Huawei AppGallery Connect to upload"
    echo "Location: $app_path/build/app/outputs/flutter-apk/app-release.apk"
}

# Create deployment summary
create_deployment_summary() {
    local app_path=$1
    local app_name=$2
    local deploy_type=$3
    
    local summary_file="$app_path/DEPLOYMENT_SUMMARY.md"
    
    cat > "$summary_file" << EOF
# Deployment Summary - $app_name

**Build Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Deployment Type:** $deploy_type
**Flutter Version:** $(flutter --version | head -1)
**Dart Version:** $(dart --version | head -1)

## Build Artifacts

### Android
- Debug APK: \`build/app/outputs/flutter-apk/app-debug.apk\`
- Release APK: \`build/app/outputs/flutter-apk/app-release.apk\`
- App Bundle (AAB): \`build/app/outputs/bundle/release/app-release.aab\`

### iOS
- Built in: \`build/ios\`
- Archive location: \`build/ios/Runner.xcarchive\`

## Deployment Checklist

### Before Uploading
- [ ] Update version code and version name
- [ ] Update release notes
- [ ] Test on physical devices
- [ ] Run all unit and integration tests
- [ ] Check analytics integration
- [ ] Verify all permissions
- [ ] Test payment flows
- [ ] Check app signing certificates

### Google Play Store
1. Upload AAB to Play Console
2. Set as internal testing first
3. Wait for review (24-48 hours)
4. Move to beta track
5. Verify in beta
6. Deploy to production

### Apple App Store
1. Archive build in Xcode
2. Sign with Apple development certificate
3. Upload to TestFlight
4. Test on TestFlight
5. Build version must increment
6. Submit for App Store review
7. Apple review takes 1-2 days

### Huawei App Gallery
1. Upload APK to AppGallery Connect
2. Fill app information
3. Select testing first
4. Verify in testing
5. Move to production
6. Huawei review takes 2-4 hours

## Distribution Links

- **Google Play Customer:** https://play.google.com/store/apps/details?id=$PACKAGE_NAME_CUSTOMER
- **Google Play Driver:** https://play.google.com/store/apps/details?id=$PACKAGE_NAME_DRIVER
- **Apple App Store Customer:** https://apps.apple.com/app/panda-rider/
- **Apple App Store Driver:** https://apps.apple.com/app/panda-rider-driver/
- **Huawei App Gallery:** https://appgallery.huawei.com/

## Notes

- All builds use ZAR currency for South Africa
- Payment gateways: Stripe, Google Pay, Apple Pay, PayFast, Ozow
- Real-time GPS tracking and WhatsApp integration enabled
- Biometric authentication (Face ID, Fingerprint) enabled

EOF
    
    echo -e "${GREEN}✓ Deployment summary created: $summary_file${NC}"
}

# Main execution
main() {
    check_prerequisites
    
    if [ "$APP_TYPE" = "customer" ] || [ "$APP_TYPE" = "both" ]; then
        echo -e "\n${GREEN}Processing Customer App...${NC}"
        
        CUSTOMER_PATH="panda-rider/flutter-customer"
        
        if [ "$DEPLOY_TYPE" = "test" ]; then
            build_android_test "$CUSTOMER_PATH" "$APP_NAME_CUSTOMER"
            echo -e "${YELLOW}To upload to Firebase App Distribution:${NC}"
            echo "firebase appdistribution:distribute build/app/outputs/flutter-apk/app-debug.apk --app <APP_ID> --groups testers"
        elif [ "$DEPLOY_TYPE" = "beta" ]; then
            build_aab "$CUSTOMER_PATH" "$APP_NAME_CUSTOMER"
            build_ios "$CUSTOMER_PATH" "$APP_NAME_CUSTOMER" "release"
            echo -e "${YELLOW}Upload AAB to Google Play (beta track)${NC}"
            echo -e "${YELLOW}Upload iOS build to TestFlight${NC}"
        elif [ "$DEPLOY_TYPE" = "production" ]; then
            build_aab "$CUSTOMER_PATH" "$APP_NAME_CUSTOMER"
            build_ios "$CUSTOMER_PATH" "$APP_NAME_CUSTOMER" "release"
            build_hab "$CUSTOMER_PATH" "$APP_NAME_CUSTOMER"
            echo -e "${YELLOW}Upload AAB to Google Play (production)${NC}"
            echo -e "${YELLOW}Upload iOS build to App Store${NC}"
            echo -e "${YELLOW}Upload APK to Huawei App Gallery${NC}"
        fi
        
        create_deployment_summary "$CUSTOMER_PATH" "$APP_NAME_CUSTOMER" "$DEPLOY_TYPE"
    fi
    
    if [ "$APP_TYPE" = "driver" ] || [ "$APP_TYPE" = "both" ]; then
        echo -e "\n${GREEN}Processing Driver App...${NC}"
        
        DRIVER_PATH="panda-rider/flutter-driver"
        
        if [ "$DEPLOY_TYPE" = "test" ]; then
            build_android_test "$DRIVER_PATH" "$APP_NAME_DRIVER"
            echo -e "${YELLOW}To upload to Firebase App Distribution:${NC}"
            echo "firebase appdistribution:distribute build/app/outputs/flutter-apk/app-debug.apk --app <APP_ID> --groups testers"
        elif [ "$DEPLOY_TYPE" = "beta" ]; then
            build_aab "$DRIVER_PATH" "$APP_NAME_DRIVER"
            build_ios "$DRIVER_PATH" "$APP_NAME_DRIVER" "release"
            echo -e "${YELLOW}Upload AAB to Google Play (beta track)${NC}"
            echo -e "${YELLOW}Upload iOS build to TestFlight${NC}"
        elif [ "$DEPLOY_TYPE" = "production" ]; then
            build_aab "$DRIVER_PATH" "$APP_NAME_DRIVER"
            build_ios "$DRIVER_PATH" "$APP_NAME_DRIVER" "release"
            build_hab "$DRIVER_PATH" "$APP_NAME_DRIVER"
            echo -e "${YELLOW}Upload AAB to Google Play (production)${NC}"
            echo -e "${YELLOW}Upload iOS build to App Store${NC}"
            echo -e "${YELLOW}Upload APK to Huawei App Gallery${NC}"
        fi
        
        create_deployment_summary "$DRIVER_PATH" "$APP_NAME_DRIVER" "$DEPLOY_TYPE"
    fi
    
    echo -e "\n${GREEN}=======================================${NC}"
    echo -e "${GREEN}  Deployment Process Complete!${NC}"
    echo -e "${GREEN}=======================================${NC}"
}

# Run main
main
