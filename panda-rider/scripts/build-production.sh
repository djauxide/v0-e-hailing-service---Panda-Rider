#!/bin/bash
# Panda Rider - Master Production Build & Deploy Script
# Builds both Huawei and iOS apps for production release
# Manages version, code signing, and deployment workflow

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS_DIR="$PROJECT_DIR/scripts"

# Version management
VERSION_FILE="$PROJECT_DIR/version.txt"
CURRENT_VERSION=$(cat "$VERSION_FILE" 2>/dev/null || echo "1.0.0")

show_menu() {
    echo -e "\n${MAGENTA}========================================${NC}"
    echo -e "${MAGENTA}  Panda Rider - Production Build System${NC}"
    echo -e "${MAGENTA}  Current Version: $CURRENT_VERSION${NC}"
    echo -e "${MAGENTA}========================================${NC}\n"
    
    echo -e "${BLUE}Build Options:${NC}"
    echo "1) Build Huawei (Customer) - Release"
    echo "2) Build Huawei (Driver) - Release"
    echo "3) Build iOS (Customer) - Release"
    echo "4) Build iOS (Driver) - Release"
    echo "5) Build Both Apps for All Stores"
    echo "6) Update Version"
    echo "7) View Build History"
    echo "8) Exit"
    echo ""
}

build_huawei_customer() {
    echo -e "\n${YELLOW}Building Huawei Customer App...${NC}"
    chmod +x "$SCRIPTS_DIR/build-huawei-release.sh"
    "$SCRIPTS_DIR/build-huawei-release.sh" customer "$CURRENT_VERSION"
}

build_huawei_driver() {
    echo -e "\n${YELLOW}Building Huawei Driver App...${NC}"
    chmod +x "$SCRIPTS_DIR/build-huawei-release.sh"
    "$SCRIPTS_DIR/build-huawei-release.sh" driver "$CURRENT_VERSION"
}

build_ios_customer() {
    echo -e "\n${YELLOW}Building iOS Customer App...${NC}"
    chmod +x "$SCRIPTS_DIR/build-ios-release.sh"
    "$SCRIPTS_DIR/build-ios-release.sh" customer "$CURRENT_VERSION" "1"
}

build_ios_driver() {
    echo -e "\n${YELLOW}Building iOS Driver App...${NC}"
    chmod +x "$SCRIPTS_DIR/build-ios-release.sh"
    "$SCRIPTS_DIR/build-ios-release.sh" driver "$CURRENT_VERSION" "1"
}

build_all_apps() {
    echo -e "\n${MAGENTA}========================================${NC}"
    echo -e "${MAGENTA}  Building All Apps for Production${NC}"
    echo -e "${MAGENTA}========================================${NC}"
    
    echo -e "\n${GREEN}Step 1/4: Huawei Customer App${NC}"
    build_huawei_customer
    
    echo -e "\n${GREEN}Step 2/4: Huawei Driver App${NC}"
    build_huawei_driver
    
    echo -e "\n${GREEN}Step 3/4: iOS Customer App${NC}"
    build_ios_customer
    
    echo -e "\n${GREEN}Step 4/4: iOS Driver App${NC}"
    build_ios_driver
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✓ All builds completed!${NC}"
    echo -e "${GREEN}========================================${NC}"
}

update_version() {
    echo -e "\n${YELLOW}Current version: $CURRENT_VERSION${NC}"
    echo "Enter new version (e.g., 1.0.1):"
    read -r new_version
    
    if [[ $new_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "$new_version" > "$VERSION_FILE"
        CURRENT_VERSION="$new_version"
        echo -e "${GREEN}✓ Version updated to $CURRENT_VERSION${NC}"
    else
        echo -e "${RED}❌ Invalid version format. Use X.Y.Z${NC}"
    fi
}

view_build_history() {
    echo -e "\n${YELLOW}Build History:${NC}"
    
    if [ -d "$PROJECT_DIR/builds" ]; then
        find "$PROJECT_DIR/builds" -name "*.apk" -o -name "*.ipa" | sort -r | head -10 | while read file; do
            size=$(du -h "$file" | cut -f1)
            date=$(stat -f %Sm -t "%Y-%m-%d %H:%M:%S" "$file" 2>/dev/null || date -r "$file" "+%Y-%m-%d %H:%M:%S")
            echo -e "${GREEN}✓${NC} $(basename "$file") - $size - $date"
        done
    else
        echo -e "${YELLOW}No builds found yet${NC}"
    fi
}

# Main loop
main() {
    while true; do
        show_menu
        read -p "Select option (1-8): " choice
        
        case $choice in
            1) build_huawei_customer ;;
            2) build_huawei_driver ;;
            3) build_ios_customer ;;
            4) build_ios_driver ;;
            5) build_all_apps ;;
            6) update_version ;;
            7) view_build_history ;;
            8) 
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *) 
                echo -e "${RED}Invalid option${NC}"
                ;;
        esac
    done
}

main "$@"
