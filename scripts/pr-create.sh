#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Validating version numbers before creating PR..."
echo ""

TODAY_IOS=$(date +%Y.%m.%d)
TODAY_ANDROID=$(date +%Y%m%d)

ERRORS=0

IOS_APP_JSON=$(grep -A 2 '"ios"' app.json | grep 'buildNumber' | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1)
IOS_INFO_PLIST=$(grep -A 1 'CFBundleVersion' ios/KooM/Info.plist | grep 'string' | sed -E 's/.*<string>([^<]+)<\/string>.*/\1/')
IOS_PROJECT_1=$(grep 'CURRENT_PROJECT_VERSION' ios/KooM.xcodeproj/project.pbxproj | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+')
IOS_PROJECT_2=$(grep 'CURRENT_PROJECT_VERSION' ios/KooM.xcodeproj/project.pbxproj | tail -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+')

ANDROID_APP_JSON=$(grep -A 2 '"android"' app.json | grep 'versionCode' | grep -oE '[0-9]+' | head -1)
ANDROID_BUILD_GRADLE=$(grep 'versionCode' android/app/build.gradle | grep -oE '[0-9]+' | head -1)

echo "📱 iOS Build Numbers:"
echo "  app.json:           $IOS_APP_JSON"
echo "  Info.plist:         $IOS_INFO_PLIST"
echo "  project.pbxproj #1: $IOS_PROJECT_1"
echo "  project.pbxproj #2: $IOS_PROJECT_2"
echo ""

echo "🤖 Android Version Codes:"
echo "  app.json:      $ANDROID_APP_JSON"
echo "  build.gradle:  $ANDROID_BUILD_GRADLE"
echo ""

if ! [[ "$IOS_APP_JSON" =~ ^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[0-9]+$ ]]; then
    echo -e "${RED}❌ iOS app.json buildNumber format invalid. Expected: YYYY.MM.DD.X${NC}"
    ERRORS=$((ERRORS + 1))
fi

if ! [[ "$ANDROID_APP_JSON" =~ ^[0-9]{8}[0-9]+$ ]]; then
    echo -e "${RED}❌ Android app.json versionCode format invalid. Expected: YYYYMMDDX${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ "$IOS_APP_JSON" != "$IOS_INFO_PLIST" ] || \
   [ "$IOS_APP_JSON" != "$IOS_PROJECT_1" ] || \
   [ "$IOS_APP_JSON" != "$IOS_PROJECT_2" ]; then
    echo -e "${RED}❌ iOS build numbers don't match across all files!${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ "$ANDROID_APP_JSON" != "$ANDROID_BUILD_GRADLE" ]; then
    echo -e "${RED}❌ Android version codes don't match across all files!${NC}"
    ERRORS=$((ERRORS + 1))
fi

IOS_DATE=$(echo "$IOS_APP_JSON" | cut -d'.' -f1-3)
IOS_INCREMENT=$(echo "$IOS_APP_JSON" | cut -d'.' -f4)
ANDROID_DATE=$(echo "$ANDROID_APP_JSON" | cut -c1-8)
ANDROID_INCREMENT=$(echo "$ANDROID_APP_JSON" | cut -c9-)

IOS_DATE_COMPARABLE=$(echo "$IOS_DATE" | tr -d '.')

if [ "$IOS_DATE_COMPARABLE" != "$ANDROID_DATE" ]; then
    echo -e "${RED}❌ Version dates don't match between iOS ($IOS_DATE) and Android ($ANDROID_DATE)!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Normalize increments: treat leading zeros as insignificant (e.g. iOS '1' == Android '01')
IOS_INCREMENT_NORM=$(echo "$IOS_INCREMENT" | sed -E 's/^0+//')
ANDROID_INCREMENT_NORM=$(echo "$ANDROID_INCREMENT" | sed -E 's/^0+//')
# Empty string -> zero
if [ -z "$IOS_INCREMENT_NORM" ]; then IOS_INCREMENT_NORM=0; fi
if [ -z "$ANDROID_INCREMENT_NORM" ]; then ANDROID_INCREMENT_NORM=0; fi

if [ "$IOS_INCREMENT_NORM" != "$ANDROID_INCREMENT_NORM" ]; then
    echo -e "${RED}❌ Version increments don't match! iOS: $IOS_INCREMENT, Android: $ANDROID_INCREMENT${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ "$IOS_DATE" != "$TODAY_IOS" ]; then
    echo -e "${YELLOW}⚠️  Warning: iOS version date ($IOS_DATE) doesn't match today ($TODAY_IOS)${NC}"
fi

if [ "$ANDROID_DATE" != "$TODAY_ANDROID" ]; then
    echo -e "${YELLOW}⚠️  Warning: Android version date ($ANDROID_DATE) doesn't match today ($TODAY_ANDROID)${NC}"
fi

echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Found $ERRORS error(s). Please fix version mismatches before creating a PR.${NC}"
    echo ""
    echo "To update versions, modify these files:"
    echo "  iOS:     app.json, ios/KooM/Info.plist, ios/KooM.xcodeproj/project.pbxproj"
    echo "  Android: app.json, android/app/build.gradle"
    echo ""
    echo "See README.md for details on version management."
    exit 1
fi

echo -e "${GREEN}✅ All version checks passed!${NC}"
echo ""

exec gh pr create "$@"
