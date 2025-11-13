#!/usr/bin/env bash
set -euo pipefail

# wipes an installed app from an Android emulator/device and fresh-installs a debug APK
# Usage:
#   ./scripts/wipe-and-fresh-install.sh [APK_PATH] [PACKAGE_NAME] [EMULATOR_SERIAL]
# Examples:
#   ./scripts/wipe-and-fresh-install.sh                              # uses default debug apk path and emulator-5554
#   ./scripts/wipe-and-fresh-install.sh /path/to/app-debug.apk        # uses provided APK
#   ./scripts/wipe-and-fresh-install.sh /path/to/app-debug.apk com.example.app emulator-5554
# Notes:
# - The script will try to detect the package name from the APK using `aapt` or `apkanalyzer`,
#   or from `android/app/src/main/AndroidManifest.xml` if present.
# - If detection fails it will search installed 3rd-party packages on the device for likely
#   candidates (containing 'nochoice' or similar). You can also pass the package name explicitly.

DEFAULT_APK="android/app/build/outputs/apk/debug/app-debug.apk"
APK_PATH="${1:-$DEFAULT_APK}"
PKG_OVERRIDE="${2:-}"
EMULATOR="${3:-emulator-5556}"

log(){ echo "[wipe-install] $*"; }

if [ ! -f "$APK_PATH" ]; then
  log "ERROR: APK not found at: $APK_PATH"
  exit 2
fi

detect_pkg_from_apk(){
  local apk="$1"
  local pkg=""
  if command -v aapt >/dev/null 2>&1; then
    pkg=$(aapt dump badging "$apk" 2>/dev/null | awk -F"'" '/package: name=/ {print $2; exit}') || true
  fi
  if [ -z "$pkg" ] && command -v apkanalyzer >/dev/null 2>&1; then
    pkg=$(apkanalyzer manifest application-id "$apk" 2>/dev/null || true)
  fi
  printf "%s" "$pkg"
}

detect_pkg_from_manifest(){
  local mf="android/app/src/main/AndroidManifest.xml"
  if [ -f "$mf" ]; then
    # crude but effective parse for package="..."
    grep -m1 -o 'package="[^"]\+' "$mf" 2>/dev/null | sed 's/package="//' || true
  fi
}

detect_pkg_on_device(){
  # search installed 3rd-party packages for likely names
  adb -s "$EMULATOR" shell pm list packages -3 | tr -d '\r' | cut -d: -f2 | grep -Ei 'no.?choice|nochoice|no-choice|nochoicealarm|nochoice_alarm' || true
}

PKG=""
if [ -n "$PKG_OVERRIDE" ]; then
  PKG="$PKG_OVERRIDE"
  log "Using package from arg: $PKG"
else
  log "Trying to detect package from APK..."
  PKG=$(detect_pkg_from_apk "$APK_PATH" || true)
  if [ -n "$PKG" ]; then
    log "Detected package from APK: $PKG"
  else
    log "Trying to detect package from AndroidManifest.xml..."
    PKG=$(detect_pkg_from_manifest || true)
    if [ -n "$PKG" ]; then
      log "Detected package from manifest: $PKG"
    else
      log "Searching installed packages on device for likely candidates..."
      CANDS=$(detect_pkg_on_device)
      if [ -n "$CANDS" ]; then
        log "Found candidate(s) on device:"; echo "$CANDS" | sed 's/^/  - /g'
        PKG=$(echo "$CANDS" | head -n1)
        log "Will use first candidate: $PKG"
      else
        log "No package detected. Please pass the package name as the 2nd argument and re-run."
        exit 3
      fi
    fi
  fi
fi

log "Uninstalling package (if installed): $PKG"
adb -s "$EMULATOR" uninstall "$PKG" || log "Uninstall returned non-zero (may not have been installed)."

log "Verifying uninstall..."
adb -s "$EMULATOR" shell pm list packages | tr -d '\r' | grep -i "${PKG##*/}" || log "Package not present (good)."

log "Installing APK: $APK_PATH -> device $EMULATOR"
# Use -r to replace if present. We intentionally do a fresh install after uninstall.
adb -s "$EMULATOR" install -r "$APK_PATH"

log "Launching app (via monkey) to start its LAUNCHER activity: $PKG"
adb -s "$EMULATOR" shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 || log "monkey failed (non-zero)."

log "Done. You can inspect the emulator to confirm the splash screen displays as expected."

exit 0
