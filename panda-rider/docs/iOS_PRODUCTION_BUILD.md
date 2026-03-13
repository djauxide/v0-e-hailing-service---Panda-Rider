# Panda Rider - iOS Production Build Configuration

This guide provides step-by-step instructions for building and submitting Panda Rider iOS apps to the Apple App Store.

## Prerequisites

### System Requirements
- macOS 12.0 or later
- Xcode 14.0 or later
- iOS deployment target: 12.0+
- 50GB free disk space for builds

### Required Accounts & Certificates
1. **Apple Developer Program** ($99/year)
   - Account at developer.apple.com
   - Apple ID with 2FA enabled

2. **App Store Connect** account (included with Developer Program)

3. **iOS Distribution Certificate**
   - Generate in Xcode: Xcode > Preferences > Accounts > Manage Certificates
   - Download from Apple Developer Portal

4. **Provisioning Profiles**
   - App Store Distribution profile
   - Must match Bundle ID: `com.pandarider.customer` or `com.pandarider.driver`

## Installation Steps

### 1. Install Required Tools
```bash
# Xcode Command Line Tools
xcode-select --install

# CocoaPods (for iOS dependencies)
sudo gem install cocoapods

# Fastlane (optional, for automation)
sudo gem install fastlane -NV
```

### 2. Set Up Code Signing

#### Option A: Automatic Code Signing (Recommended)
1. Open `panda-rider/flutter-customer/ios/Runner.xcworkspace` in Xcode
2. Select "Runner" project
3. Go to Signing & Capabilities tab
4. Enable "Automatically manage signing"
5. Select your Development Team
6. Xcode will automatically create and manage certificates

#### Option B: Manual Code Signing
1. Generate Certificate Signing Request (CSR)
2. Create distribution certificate on Apple Developer Portal
3. Download and install certificate
4. Create App Store provisioning profile
5. Download provisioning profile
6. Install profile: Double-click or drag to Xcode

### 3. Prepare App Information

Create `ios/ExportOptions.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>thinning</key>
    <string><none></string>
    <key>uploadBitcode</key>
    <false/>
</dict>
</plist>
```

## Building Process

### Build for Testing (TestFlight)
```bash
cd panda-rider/scripts
chmod +x build-ios-release.sh

# Build customer app
./build-ios-release.sh customer 1.0.0 1

# Build driver app
./build-ios-release.sh driver 1.0.0 1
```

### Output
- Location: `panda-rider/builds/ios/`
- Files: `panda-rider-customer-1.0.0_1.ipa`

## App Store Submission Checklist

### Before Submission
- [ ] Version number updated in `pubspec.yaml`
- [ ] Build number incremented
- [ ] iOS deployment target set to 12.0+
- [ ] All required capabilities enabled in Xcode
- [ ] Code signing certificate valid
- [ ] Privacy policy URL updated
- [ ] Support URL provided
- [ ] Pricing and availability set

### App Information Required
- **App Name**: Panda Rider (or Panda Rider Driver)
- **Subtitle**: Multi-service e-hailing for South Africa
- **Description**: 
  ```
  Panda Rider is a comprehensive e-hailing platform providing:
  - Ride booking with real-time GPS tracking
  - Food delivery service
  - Courier delivery service
  - Secure payments in ZAR (South African Rand)
  - P2P money transfers
  - Multiple payment methods (Apple Pay, cards, wallets)
  - Biometric authentication
  ```
- **Category**: Lifestyle
- **Keywords**: ride, taxi, delivery, South Africa, payment, ZAR
- **Support URL**: https://pandarider.co.za/support
- **Privacy Policy**: https://pandarider.co.za/privacy
- **Screenshots**: 5 per screen size (iPhone 14 Pro Max, iPhone 8)
- **Preview Video**: Optional (recommended)

### Upload to App Store Connect

#### Method 1: Using Xcode (Recommended)
1. Open Runner.xcworkspace in Xcode
2. Product > Archive
3. Validate App
4. Distribute App > App Store Connect > Upload

#### Method 2: Using Apple Transporter
```bash
# Install Apple Transporter
# Available from App Store

# Use GUI to upload .ipa file
```

#### Method 3: Using Fastlane
```bash
# Install Fastlane
sudo gem install fastlane -NV

# Initialize (one-time)
cd panda-rider/flutter-customer
fastlane init

# Upload
fastlane ios upload_to_appstore ipa:"builds/ios/panda-rider-customer-1.0.0_1.ipa"
```

### TestFlight Distribution
1. Sign in to App Store Connect
2. TestFlight > iOS Builds
3. Select your build
4. Add internal testers (you + your team)
5. Send invitations
6. Wait 5-15 minutes for processing
7. Testers install via TestFlight app

### App Store Review Process
1. Submit for Review in App Store Connect
2. Apple reviews (typically 24-48 hours)
3. Possible states:
   - **In Review** - Being reviewed
   - **Pending Contract** - Accept updated agreements
   - **Ready for Sale** - Approved!
   - **Rejected** - Address issues and resubmit

### Post-Submission
- [ ] Monitor App Store Connect for review status
- [ ] Respond to rejection feedback if needed
- [ ] Set release date (immediate or scheduled)
- [ ] Monitor user reviews and ratings
- [ ] Collect crash logs and feedback

## Version Management

### Version Format
Format: `MARKETING_VERSION.BUILD_NUMBER`
- Example: `1.0.0` (version 1.0.0)

### Incrementing Versions
- **Patch** (1.0.1): Bug fixes only
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes, major updates

## Troubleshooting

### Common Issues

#### "Code Signing Identity not found"
```bash
# Refresh signing certificates
xcode-select --reset
xcode-select --install
```

#### "Provisioning Profile doesn't include the entitlements"
- Regenerate provisioning profile
- Download latest profile
- Refresh signing in Xcode (Cmd+Shift+K)

#### "Unable to upload to App Store"
```bash
# Check App Store connectivity
curl -I https://appstoreconnect.apple.com

# Validate IPA before upload
xcrun altool --validate-app -f app.ipa -t ios -u apple_id@example.com -p app_password
```

#### Build Fails with Pod Installation Error
```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod install --repo-update
cd ..
flutter clean
flutter pub get
```

## Support

For issues or questions:
- iOS Development: https://developer.apple.com/support/
- App Store Connect Help: https://support.apple.com/app-store-connect
- Panda Rider Support: support@pandarider.co.za

## Additional Resources

- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Xcode Help](https://help.apple.com/xcode/)
- [Flutter iOS Deployment](https://flutter.dev/docs/deployment/ios)
