#!/bin/bash
# Panda Rider - Local Run and Debug Script
# Run applications locally for development and testing

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_TYPE=${1:-all} # all, backend, customer, driver
ANDROID_EMULATOR=${2:-false}
IOS_SIMULATOR=${3:-false}

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}  Panda Rider - Development Runner${NC}"
echo -e "${GREEN}=======================================${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "\n${YELLOW}Checking prerequisites...${NC}"
    
    if ! command -v flutter &> /dev/null; then
        echo -e "${RED}❌ Flutter is not installed${NC}"
        echo "Install from: https://flutter.dev/docs/get-started/install"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Flutter: $(flutter --version | head -1)${NC}"
    echo -e "${GREEN}✓ Dart: $(dart --version)${NC}"
}

# Start Android Emulator
start_android_emulator() {
    echo -e "\n${YELLOW}Starting Android Emulator...${NC}"
    
    if ! command -v emulator &> /dev/null; then
        echo -e "${RED}❌ Android Emulator not found${NC}"
        echo "Set ANDROID_HOME environment variable correctly"
        return 1
    fi
    
    emulator -avd Pixel_5_API_31 &
    sleep 10
    
    echo -e "${GREEN}✓ Android Emulator started${NC}"
}

# Start iOS Simulator
start_ios_simulator() {
    echo -e "\n${YELLOW}Starting iOS Simulator...${NC}"
    
    if [ "$(uname)" != "Darwin" ]; then
        echo -e "${RED}❌ iOS Simulator only available on macOS${NC}"
        return 1
    fi
    
    open -a Simulator
    sleep 5
    
    echo -e "${GREEN}✓ iOS Simulator started${NC}"
}

# Run backend server
run_backend() {
    echo -e "\n${BLUE}Starting Backend Server...${NC}"
    
    cd panda-rider/backend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}✓ Backend dependencies ready${NC}"
    echo -e "${YELLOW}Starting server on port 3000...${NC}"
    
    npm run dev
}

# Run customer app
run_customer_app() {
    echo -e "\n${BLUE}Starting Customer App...${NC}"
    
    cd panda-rider/flutter-customer
    
    flutter pub get
    
    echo -e "${YELLOW}Available devices:${NC}"
    flutter devices
    
    echo -e "\n${YELLOW}Launching app...${NC}"
    flutter run -v
}

# Run driver app
run_driver_app() {
    echo -e "\n${BLUE}Starting Driver App...${NC}"
    
    cd panda-rider/flutter-driver
    
    flutter pub get
    
    echo -e "${YELLOW}Available devices:${NC}"
    flutter devices
    
    echo -e "\n${YELLOW}Launching app...${NC}"
    flutter run -v
}

# Run Next.js admin dashboard
run_admin_dashboard() {
    echo -e "\n${BLUE}Starting Admin Dashboard...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    
    echo -e "${YELLOW}Starting dashboard on http://localhost:3000${NC}"
    
    npm run dev
}

# Build debug APKs
build_debug_apks() {
    echo -e "\n${YELLOW}Building debug APKs...${NC}"
    
    # Customer app
    echo -e "${BLUE}Building Customer App APK...${NC}"
    cd panda-rider/flutter-customer
    flutter build apk --debug
    echo -e "${GREEN}✓ Customer APK: build/app/outputs/flutter-apk/app-debug.apk${NC}"
    
    cd ../..
    
    # Driver app
    echo -e "${BLUE}Building Driver App APK...${NC}"
    cd panda-rider/flutter-driver
    flutter build apk --debug
    echo -e "${GREEN}✓ Driver APK: build/app/outputs/flutter-apk/app-debug.apk${NC}"
}

# Install debug APKs to connected device
install_debug_apks() {
    echo -e "\n${YELLOW}Installing debug APKs to connected device...${NC}"
    
    if ! command -v adb &> /dev/null; then
        echo -e "${RED}❌ adb not found${NC}"
        return 1
    fi
    
    # Customer app
    echo -e "${BLUE}Installing Customer App...${NC}"
    adb install panda-rider/flutter-customer/build/app/outputs/flutter-apk/app-debug.apk
    echo -e "${GREEN}✓ Customer app installed${NC}"
    
    # Driver app
    echo -e "${BLUE}Installing Driver App...${NC}"
    adb install panda-rider/flutter-driver/build/app/outputs/flutter-apk/app-debug.apk
    echo -e "${GREEN}✓ Driver app installed${NC}"
}

# Run tests
run_tests() {
    echo -e "\n${YELLOW}Running tests...${NC}"
    
    # Backend tests
    echo -e "${BLUE}Backend tests...${NC}"
    cd panda-rider/backend
    npm test
    
    cd ../..
    
    # Flutter tests
    echo -e "${BLUE}Customer app tests...${NC}"
    cd panda-rider/flutter-customer
    flutter test
    
    cd ../..
    
    echo -e "${BLUE}Driver app tests...${NC}"
    cd panda-rider/flutter-driver
    flutter test
}

# Show device logs
show_device_logs() {
    echo -e "\n${YELLOW}Showing device logs (Ctrl+C to stop)...${NC}"
    
    flutter logs -v
}

# Menu system
show_menu() {
    echo -e "\n${BLUE}Development Options:${NC}"
    echo "1) Run backend server"
    echo "2) Run customer app (Flutter)"
    echo "3) Run driver app (Flutter)"
    echo "4) Run admin dashboard (Next.js)"
    echo "5) Build debug APKs"
    echo "6) Install debug APKs to device"
    echo "7) Start Android Emulator"
    echo "8) Start iOS Simulator"
    echo "9) Show device logs"
    echo "10) Run all tests"
    echo "0) Exit"
    echo -n "Select option: "
}

# Main execution
if [ "$APP_TYPE" = "all" ]; then
    echo -e "${YELLOW}Running interactive menu...${NC}"
    
    check_prerequisites
    
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1) run_backend ;;
            2) run_customer_app ;;
            3) run_driver_app ;;
            4) run_admin_dashboard ;;
            5) build_debug_apks ;;
            6) install_debug_apks ;;
            7) start_android_emulator ;;
            8) start_ios_simulator ;;
            9) show_device_logs ;;
            10) run_tests ;;
            0) echo -e "${GREEN}Exiting...${NC}"; exit 0 ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac
    done
elif [ "$APP_TYPE" = "backend" ]; then
    check_prerequisites
    run_backend
elif [ "$APP_TYPE" = "customer" ]; then
    check_prerequisites
    if [ "$ANDROID_EMULATOR" = "true" ]; then
        start_android_emulator
    fi
    run_customer_app
elif [ "$APP_TYPE" = "driver" ]; then
    check_prerequisites
    if [ "$ANDROID_EMULATOR" = "true" ]; then
        start_android_emulator
    fi
    run_driver_app
else
    echo -e "${RED}Unknown app type: $APP_TYPE${NC}"
    echo "Usage: ./run.sh [all|backend|customer|driver] [android_emulator] [ios_simulator]"
    exit 1
fi
