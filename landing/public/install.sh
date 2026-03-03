#!/bin/bash
# DevUtils Desktop — One-line installer for macOS
# Usage: curl -sL https://devutils-mac.vercel.app/install.sh | bash

set -e

APP_NAME="devutils-desktop"
DMG_URL="https://github.com/twincodevn/devutils-desktop/releases/download/v1.0.0/devutils-desktop_0.1.0_aarch64.dmg"
DMG_FILE="/tmp/${APP_NAME}.dmg"
MOUNT_DIR="/tmp/${APP_NAME}-mount"
APP_PATH="/Applications/devutils-desktop.app"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}⚡ DevUtils Desktop Installer${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# Step 1: Download DMG
echo -e "${YELLOW}📥 Downloading DevUtils Desktop...${NC}"
curl -L --progress-bar "$DMG_URL" -o "$DMG_FILE"
echo -e "${GREEN}✅ Download complete${NC}"

# Step 2: Mount DMG
echo -e "${YELLOW}📦 Mounting disk image...${NC}"
hdiutil attach "$DMG_FILE" -nobrowse -mountpoint "$MOUNT_DIR" -quiet
echo -e "${GREEN}✅ Mounted${NC}"

# Step 3: Copy to Applications
echo -e "${YELLOW}📂 Installing to /Applications...${NC}"
if [ -d "$APP_PATH" ]; then
  rm -rf "$APP_PATH"
fi
cp -R "$MOUNT_DIR"/*.app /Applications/
echo -e "${GREEN}✅ Installed${NC}"

# Step 4: Remove quarantine flag (bypass Gatekeeper)
echo -e "${YELLOW}🔓 Removing quarantine flag...${NC}"
xattr -cr "$APP_PATH" 2>/dev/null || true
echo -e "${GREEN}✅ Gatekeeper bypassed${NC}"

# Step 5: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
hdiutil detach "$MOUNT_DIR" -quiet 2>/dev/null || true
rm -f "$DMG_FILE"
echo -e "${GREEN}✅ Cleanup done${NC}"

echo ""
echo -e "${GREEN}🎉 DevUtils Desktop has been installed!${NC}"
echo -e "${CYAN}   Open it from /Applications or Spotlight (⌘+Space)${NC}"
echo ""

# Step 6: Open the app
open "$APP_PATH"
