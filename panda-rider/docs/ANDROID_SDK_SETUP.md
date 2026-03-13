# Android SDK Setup & Configuration Guide
## Panda Rider Project - ZAR Currency, South Africa

This guide covers complete Android SDK setup for building Panda Rider apps for Google Play, Huawei App Gallery, and Firebase distribution.

---

## Prerequisites

- **Operating System**: macOS, Linux, or Windows
- **Java**: JDK 11 or higher
- **Flutter**: Latest stable version
- **Command-line tools**: git, curl

---

## Step 1: Install Java/JDK

### macOS (Homebrew)
```bash
brew install openjdk@11
export JAVA_HOME=$(/usr/libexec/java_home)
echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.zshrc
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install openjdk-11-jdk
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
```

### Windows
Download and install from [oracle.com](https://www.oracle.com/java/technologies/downloads/#java11)

### Verify Installation
```bash
java -version
# Should show: openjdk version "11.x.x"
```

---

## Step 2: Install Android SDK

### Automated Setup (Recommended)
```bash
cd panda-rider/scripts
chmod +x configure-android-sdk.sh
./configure-android-sdk.sh
```

The script will:
1. Check for existing Android SDK
2. Install or verify Android SDK components
3. Download required platforms and build tools
4. Accept Android SDK licenses
5. Configure environment variables
6. Test Flutter Android build

### Manual Setup

#### Download Android SDK
1. Visit [Android Studio Download](https://developer.android.com/studio)
2. Download **Command-line Tools Only** (not full Android Studio)
3. Extract to appropriate location:
   - **macOS/Linux**: `~/Library/Android/sdk` or `~/Android/Sdk`
   - **Windows**: `C:\Users\<username>\AppData\Local\Android\sdk`

#### Set Environment Variables

**macOS/Linux** (~/.bashrc, ~/.zshrc, or ~/.profile):
```bash
export ANDROID_SDK_ROOT=~/Library/Android/sdk
export ANDROID_HOME=$ANDROID_SDK_ROOT
export PATH=$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/tools:$PATH
export PATH=$ANDROID_SDK_ROOT/build-tools/35.0.0:$PATH
```

**Windows** (System Environment Variables):
```
ANDROID_SDK_ROOT = C:\Users\<username>\AppData\Local\Android\sdk
ANDROID_HOME = C:\Users\<username>\AppData\Local\Android\sdk
Add to PATH: C:\Users\<username>\AppData\Local\Android\sdk\platform-tools
Add to PATH: C:\Users\<username>\AppData\Local\Android\sdk\tools
```

Reload environment:
```bash
source ~/.zshrc  # macOS/Linux
# Windows: Restart terminal
```

---

## Step 3: Install Android SDK Components

### Using sdkmanager (Automated)
```bash
cd panda-rider/scripts
./configure-android-sdk.sh
```

### Manual Installation
```bash
# Accept licenses
yes | sdkmanager --licenses

# Install platform tools
sdkmanager "platform-tools"

# Install build tools (latest)
sdkmanager "build-tools;35.0.0"

# Install Android platforms
sdkmanager "platforms;android-35"  # Android 15 (latest)
sdkmanager "platforms;android-34"  # Android 14
sdkmanager "platforms;android-33"  # Android 13
sdkmanager "platforms;android-32"  # Android 12
sdkmanager "platforms;android-31"  # Android 12 API 31

# Install NDK (optional but recommended for performance)
sdkmanager "ndk;25.2.9519653"

# Install emulator (optional)
sdkmanager "emulator"
sdkmanager "system-images;android-35;google_apis;arm64-v8a"
```

---

## Step 4: Verify Installation

```bash
# Run Flutter doctor
flutter doctor -v

# Expected output should show:
# ✓ Android toolchain - develop for Android devices
# ✓ Android SDK at [path]
# ✓ Android SDK Platform 35
# ✓ Android SDK Build-tools 35.0.0

# Check specific components
sdkmanager --list_installed

# Test AVD (Android Virtual Device)
emulator -list-avds
```

---

## Step 5: Configure Flutter for Android

```bash
cd panda-rider/flutter-customer

# Get Flutter dependencies
flutter pub get

# Run Flutter doctor
flutter doctor -v

# Accept Android licenses
flutter doctor --android-licenses

# Configure Android project
flutterfire configure
```

---

## Step 6: Build APKs for Production

### Google Play Store (AAB Format)
```bash
cd panda-rider/scripts
./deploy-app-stores.sh production customer
# or
./build-production.sh
```

### Huawei App Gallery
```bash
./build-huawei-release.sh customer 1.0.0
```

### Debug/Test Builds
```bash
flutter build apk --debug
flutter build apk --release --split-per-abi
```

---

## Supported Android API Levels

| API Level | Android Version | Min Support |
|-----------|-----------------|-------------|
| 35 | Android 15 | Recommended |
| 34 | Android 14 | Supported |
| 33 | Android 13 | Supported |
| 32 | Android 12 | Supported |
| 31 | Android 12 | Minimum |
| 30 | Android 11 | Limited |

**Panda Rider Minimum**: API 31 (Android 12)
**Target API**: 35 (Android 15)

---

## Build Tools & SDK Tools Versions

| Component | Version | Purpose |
|-----------|---------|---------|
| Build Tools | 35.0.0 | APK compilation |
| Platform Tools | Latest | ADB, FastBoot |
| NDK | 25.2.9519653 | Native code (optional) |
| Emulator | Latest | Testing |

---

## Android SDK Directory Structure

```
$ANDROID_SDK_ROOT/
├── cmdline-tools/
│   └── latest/
│       └── bin/
│           ├── sdkmanager
│           ├── avdmanager
│           └── lint
├── platforms/
│   ├── android-35/
│   ├── android-34/
│   └── android-33/
├── build-tools/
│   ├── 35.0.0/
│   └── 34.0.0/
├── platform-tools/  (adb, fastboot, logcat)
├── tools/
├── ndk/
│   └── 25.2.9519653/
└── system-images/
    └── android-35/
```

---

## Common Issues & Solutions

### Issue: ANDROID_SDK_ROOT not found
```bash
# Solution: Set manually
export ANDROID_SDK_ROOT=~/Library/Android/sdk
# Add to shell profile for persistence
```

### Issue: Java version mismatch
```bash
# Check version
java -version

# Solution: Install Java 11+
# macOS: brew install openjdk@11
# Linux: sudo apt-get install openjdk-11-jdk
```

### Issue: sdkmanager command not found
```bash
# Solution: Add to PATH
export PATH=$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$PATH
```

### Issue: Build fails with "Gradle build failed"
```bash
# Solution: Clean and rebuild
cd panda-rider/flutter-customer
flutter clean
flutter pub get
flutter build apk --release --verbose
```

### Issue: Emulator won't start
```bash
# Solution: Create new AVD
emulator -avd-create -name Panda-Test -k "system-images;android-35;google_apis;arm64-v8a"
emulator -avd Panda-Test
```

### Issue: Port 5037 already in use (ADB)
```bash
# Solution: Kill existing ADB
adb kill-server
adb start-server
```

---

## Testing on Physical Device

### Enable Developer Mode (Android 12+)
1. Settings → About phone
2. Tap Build number 7 times
3. Go to Developer options
4. Enable USB Debugging

### Connect Device
```bash
# List connected devices
adb devices

# Install app
adb install -r path/to/app.apk

# View logs
adb logcat

# Uninstall app
adb uninstall com.pandarider.customer
```

---

## Continuous Integration Setup

For GitHub Actions CI/CD:

```yaml
name: Android Build
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '11'
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter build apk --release
      - uses: actions/upload-artifact@v2
        with:
          name: app-release.apk
          path: build/app/outputs/flutter-apk/app-release.apk
```

---

## Performance Optimization

### Reduce Build Size
```bash
flutter build apk --release --split-per-abi
# Creates separate APKs for: arm64-v8a, armeabi-v7a
```

### Faster Builds
```bash
# Multithreaded build
flutter build apk --release -j 4
```

### ProGuard Obfuscation
Enabled by default in release builds for security.

---

## Deployment Checklist

- [ ] Android SDK properly installed and configured
- [ ] ANDROID_SDK_ROOT and JAVA_HOME environment variables set
- [ ] Flutter doctor shows no issues
- [ ] Build successfully locally
- [ ] Test on physical device (API 31+)
- [ ] Test on emulator for different API levels
- [ ] Version number updated in pubspec.yaml
- [ ] Keystore configured for signing
- [ ] Release notes prepared
- [ ] Screenshots and metadata ready for app stores

---

## Resources

- [Flutter Android Setup](https://flutter.dev/docs/get-started/install/linux#android-setup)
- [Android SDK Documentation](https://developer.android.com/studio/releases/sdk-tools)
- [Google Play Console](https://play.google.com/console)
- [Huawei AppGallery Connect](https://appgallery.cloud.huawei.com)
- [Firebase App Distribution](https://firebase.google.com/docs/app-distribution)

---

## Currency & Region

**Project**: Panda Rider
**Currency**: ZAR (South African Rand)
**Region**: South Africa
**Minimum Android API**: 31
**Target Android API**: 35

---

*Last Updated: 2024*
*For support: See project README.md*
