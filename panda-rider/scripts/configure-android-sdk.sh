#!/bin/bash
# Panda Rider - Android SDK Configuration & Validation
# Ensures proper Android SDK setup for all builds
# Currency: ZAR (South African Rand)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Android SDK Configuration & Validation${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check and set ANDROID_SDK_ROOT
check_android_sdk() {
    echo -e "\n${YELLOW}Checking Android SDK...${NC}"
    
    # Try to find Android SDK
    if [ -z "$ANDROID_SDK_ROOT" ]; then
        echo -e "${YELLOW}ANDROID_SDK_ROOT not set. Searching for Android SDK...${NC}"
        
        # Common Android SDK locations
        local sdk_paths=(
            "$HOME/Library/Android/sdk"           # macOS
            "$HOME/Android/Sdk"                    # Linux
            "/opt/android-sdk"                     # Linux alternative
            "$HOME/.android/android-sdk"           # Another alternative
            "C:\\Users\\$USER\\AppData\\Local\\Android\\sdk"  # Windows
        )
        
        local found_sdk=""
        for path in "${sdk_paths[@]}"; do
            if [ -d "$path" ]; then
                found_sdk="$path"
                echo -e "${GREEN}Found Android SDK at: $found_sdk${NC}"
                break
            fi
        done
        
        if [ -z "$found_sdk" ]; then
            echo -e "${RED}❌ Android SDK not found${NC}"
            echo -e "${YELLOW}Please install Android SDK or set ANDROID_SDK_ROOT environment variable${NC}"
            echo -e "${YELLOW}Visit: https://developer.android.com/studio${NC}"
            exit 1
        fi
        
        export ANDROID_SDK_ROOT="$found_sdk"
    else
        echo -e "${GREEN}ANDROID_SDK_ROOT set to: $ANDROID_SDK_ROOT${NC}"
    fi
    
    if [ ! -d "$ANDROID_SDK_ROOT" ]; then
        echo -e "${RED}❌ ANDROID_SDK_ROOT directory not found: $ANDROID_SDK_ROOT${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Android SDK found${NC}"
}

# Check Android SDK components
check_sdk_components() {
    echo -e "\n${YELLOW}Checking Android SDK components...${NC}"
    
    local sdk_manager="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager"
    local android_bin="$ANDROID_SDK_ROOT/tools/android"
    
    if [ ! -f "$sdk_manager" ] && [ ! -f "$android_bin" ]; then
        echo -e "${YELLOW}SDK Manager not found in expected locations${NC}"
        echo -e "${YELLOW}Installing cmdline-tools...${NC}"
        
        # Create cmdline-tools directory if it doesn't exist
        mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"
        
        echo -e "${YELLOW}Please download cmdline-tools from:${NC}"
        echo "https://developer.android.com/studio#command-tools"
        echo -e "${YELLOW}And extract to: $ANDROID_SDK_ROOT/cmdline-tools/latest${NC}"
        
        read -p "Press enter once you've installed cmdline-tools: "
    fi
    
    # Find sdkmanager executable
    local sdkmanager_path=""
    if [ -f "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]; then
        sdkmanager_path="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager"
    elif [ -f "$ANDROID_SDK_ROOT/tools/bin/sdkmanager" ]; then
        sdkmanager_path="$ANDROID_SDK_ROOT/tools/bin/sdkmanager"
    fi
    
    if [ -z "$sdkmanager_path" ]; then
        echo -e "${RED}❌ sdkmanager not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ SDK Manager found at: $sdkmanager_path${NC}"
    
    # Make executable
    chmod +x "$sdkmanager_path"
    
    echo -e "\n${YELLOW}Checking required SDK components...${NC}"
    
    # Required Android SDK levels
    local required_platforms=(
        "platforms;android-35"  # Latest (Android 15)
        "platforms;android-34"  # Android 14
        "platforms;android-33"  # Android 13
        "platforms;android-32"  # Android 12
        "platforms;android-31"  # Android 12 (API 31)
    )
    
    # Build tools
    local required_build_tools="build-tools;35.0.0"
    
    # Platform tools
    local required_platform_tools="platform-tools"
    
    # NDK (for performance-critical code)
    local required_ndk="ndk;25.2.9519653"
    
    # Accept licenses
    echo -e "${YELLOW}Accepting Android SDK licenses...${NC}"
    yes | "$sdkmanager_path" --licenses > /dev/null 2>&1 || true
    
    # Install platform tools
    echo -e "${YELLOW}Installing platform-tools...${NC}"
    "$sdkmanager_path" "$required_platform_tools" --verbose
    
    # Install build tools
    echo -e "${YELLOW}Installing build-tools...${NC}"
    "$sdkmanager_path" "$required_build_tools" --verbose
    
    # Install Android platforms
    echo -e "${YELLOW}Installing Android SDK platforms...${NC}"
    for platform in "${required_platforms[@]}"; do
        "$sdkmanager_path" "$platform" --verbose || true
    done
    
    # Install NDK (optional but recommended)
    read -p "Install NDK for native code support? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Installing NDK...${NC}"
        "$sdkmanager_path" "$required_ndk" --verbose
    fi
    
    echo -e "${GREEN}✓ SDK components installed/verified${NC}"
}

# Configure environment variables
configure_environment() {
    echo -e "\n${YELLOW}Configuring environment variables...${NC}"
    
    # Add to current shell
    export ANDROID_SDK_ROOT
    export ANDROID_HOME="$ANDROID_SDK_ROOT"
    export PATH="$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/tools:$PATH"
    
    echo -e "${GREEN}✓ Environment variables configured${NC}"
    
    # Suggest adding to shell profile
    echo -e "\n${BLUE}To make these permanent, add to your shell profile (~/.bashrc, ~/.zshrc, etc.):${NC}"
    echo "export ANDROID_SDK_ROOT=\"$ANDROID_SDK_ROOT\""
    echo "export ANDROID_HOME=\"$ANDROID_SDK_ROOT\""
    echo "export PATH=\"\$ANDROID_SDK_ROOT/platform-tools:\$ANDROID_SDK_ROOT/tools:\$PATH\""
}

# Check Java/JDK
check_java() {
    echo -e "\n${YELLOW}Checking Java/JDK...${NC}"
    
    if ! command_exists java; then
        echo -e "${RED}❌ Java/JDK not found${NC}"
        echo -e "${YELLOW}Install Java 11 or higher${NC}"
        exit 1
    fi
    
    local java_version=$(java -version 2>&1 | grep -oP 'version "\K[^"]*')
    echo -e "${GREEN}✓ Java installed: $java_version${NC}"
    
    # Set JAVA_HOME if not set
    if [ -z "$JAVA_HOME" ]; then
        export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
        echo -e "${GREEN}✓ JAVA_HOME set to: $JAVA_HOME${NC}"
    fi
}

# Check Gradle
check_gradle() {
    echo -e "\n${YELLOW}Checking Gradle...${NC}"
    
    if ! command_exists gradle; then
        echo -e "${YELLOW}Gradle not found in PATH${NC}"
        echo -e "${YELLOW}This is normal - Flutter uses gradle wrapper${NC}"
        echo -e "${GREEN}✓ Flutter will handle Gradle${NC}"
        return
    fi
    
    local gradle_version=$(gradle -v | grep "Gradle" | head -1)
    echo -e "${GREEN}✓ Gradle installed: $gradle_version${NC}"
}

# Validate Android SDK
validate_sdk() {
    echo -e "\n${YELLOW}Validating Android SDK installation...${NC}"
    
    # Check key directories
    local required_dirs=(
        "platforms"
        "build-tools"
        "platform-tools"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$ANDROID_SDK_ROOT/$dir" ]; then
            echo -e "${RED}❌ Missing directory: $dir${NC}"
            return 1
        fi
        echo -e "${GREEN}✓ Found: $dir${NC}"
    done
    
    echo -e "${GREEN}✓ Android SDK validation passed${NC}"
}

# Test build with Flutter
test_flutter_build() {
    echo -e "\n${YELLOW}Testing Flutter Android build...${NC}"
    
    read -p "Test Flutter Android build? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$PROJECT_DIR/flutter-customer"
        echo -e "${YELLOW}Running Flutter doctor...${NC}"
        flutter doctor -v
        
        echo -e "${YELLOW}Running Flutter pub get...${NC}"
        flutter pub get
        
        echo -e "${YELLOW}Building test APK (this may take 5-10 minutes)...${NC}"
        if flutter build apk --debug --verbose; then
            echo -e "${GREEN}✓ Flutter Android build successful!${NC}"
        else
            echo -e "${RED}❌ Flutter Android build failed${NC}"
            echo -e "${YELLOW}Check Flutter and Android SDK installation${NC}"
            return 1
        fi
    fi
}

# Generate configuration report
generate_report() {
    echo -e "\n${YELLOW}Generating configuration report...${NC}"
    
    local report_file="$PROJECT_DIR/android-sdk-config-report.txt"
    
    cat > "$report_file" << EOF
Android SDK Configuration Report
=================================

Generated: $(date)
Project: Panda Rider

Environment Variables:
- ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT
- ANDROID_HOME: $ANDROID_HOME
- JAVA_HOME: $JAVA_HOME

Android SDK Location: $ANDROID_SDK_ROOT

Key Directories:
- Platforms: $ANDROID_SDK_ROOT/platforms
- Build Tools: $ANDROID_SDK_ROOT/build-tools
- Platform Tools: $ANDROID_SDK_ROOT/platform-tools

System Information:
- Java Version: $(java -version 2>&1 | head -1)
- Flutter Version: $(flutter --version)
- Dart Version: $(dart --version)

Supported Build Targets:
- Android 15 (API 35) - Latest
- Android 14 (API 34)
- Android 13 (API 33)
- Android 12 (API 32/31)

Next Steps:
1. Run: ./panda-rider/scripts/build-huawei-release.sh customer 1.0.0
2. Run: ./panda-rider/scripts/build-production.sh
3. For iOS: ./panda-rider/scripts/build-ios-release.sh

Currency Support: ZAR (South African Rand)
Region: South Africa

Troubleshooting:
- If builds fail, run: flutter clean && flutter pub get
- Update SDK: $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --update
- Run: flutter doctor -v for detailed diagnostics

EOF
    
    cat "$report_file"
    echo -e "${GREEN}✓ Report saved to: $report_file${NC}"
}

# Main execution
main() {
    check_android_sdk
    check_java
    check_gradle
    check_sdk_components
    configure_environment
    validate_sdk
    test_flutter_build
    generate_report
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✓ Android SDK Configuration Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "\n${BLUE}Ready to build apps for:${NC}"
    echo -e "${BLUE}  - Google Play Store${NC}"
    echo -e "${BLUE}  - Huawei App Gallery${NC}"
    echo -e "${BLUE}  - Firebase App Distribution${NC}\n"
}

main "$@"
