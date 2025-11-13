#!/usr/bin/env bash
set -euo pipefail

# generate-icons.sh
# Usage: ./scripts/generate-icons.sh [SOURCE_IMAGE] [OUT_DIR]
# Example: ./scripts/generate-icons.sh assets/images/icon.png assets/generated-icons

SRC=${1:-assets/images/icon_2025.png}
OUT_DIR=${2:-assets/generated-icons}
# Safety: pass --force as third arg to allow writing directly into native project folders
FORCE=${3:-}

# Prevent accidental overwrites of native projects. If OUT_DIR points into ios/ or android/
# refuse unless the user explicitly passes --force as the 3rd argument.
if [[ "$OUT_DIR" == ios/* || "$OUT_DIR" == android/* ]]; then
  if [[ "$FORCE" != "--force" && "$FORCE" != "-f" ]]; then
    echo "Refusing to write directly into native folders: $OUT_DIR" >&2
    echo "If you really want to overwrite native assets, re-run with --force as the 3rd argument." >&2
    exit 2
  else
    echo "Warning: writing directly into native folder $OUT_DIR (user supplied --force)."
  fi
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required but not installed. Install ffmpeg and retry." >&2
  exit 1
fi

if [ ! -f "$SRC" ]; then
  echo "Source image not found: $SRC" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# Splash screen source image (fullscreen, no padding)
SPLASH_SRC=${SPLASH_SRC:-assets/images/splash-screen_2025.jpg}

# Helper to scale and pad to square while preserving aspect ratio (for icons)
# Usage: generate <width> <height> <out_file>
generate() {
  local w=$1; local h=$2; local out=$3
  # Use ffmpeg to scale preserving aspect, then pad to exact size
    # Run ffmpeg, hide stdout but keep stderr so errors are visible to the user
    # Use -update 1 with image2 muxer to overwrite single output files cleanly
    # Temporarily disable 'set -e' so ffmpeg warnings don't abort the whole script
    set +e
    ffmpeg -y -i "$SRC" -vf "scale=w=${w}:h=${h}:force_original_aspect_ratio=decrease, pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2, format=rgba" -update 1 -frames:v 1 "$out" > /dev/null
    rc=$?
    set -e
    if [ $rc -ne 0 ]; then
      echo "Warning: ffmpeg returned non-zero exit code ($rc) while generating $out" >&2
    fi
}

# Helper to scale splash screens (no padding, just scale to exact dimensions)
# Usage: generate_splash <width> <height> <out_file>
generate_splash() {
  local w=$1; local h=$2; local out=$3
  set +e
  ffmpeg -y -i "$SPLASH_SRC" -vf "scale=${w}:${h}" -update 1 -frames:v 1 "$out" > /dev/null
  rc=$?
  set -e
  if [ $rc -ne 0 ]; then
    echo "Warning: ffmpeg returned non-zero exit code ($rc) while generating splash $out" >&2
  fi
}

echo "Generating icons from $SRC into $OUT_DIR"

# Android mipmap launcher icons
ANDROID_OUT="$OUT_DIR/android"
mkdir -p "$ANDROID_OUT/mipmap-mdpi" "$ANDROID_OUT/mipmap-hdpi" "$ANDROID_OUT/mipmap-xhdpi" "$ANDROID_OUT/mipmap-xxhdpi" "$ANDROID_OUT/mipmap-xxxhdpi"

# mdpi 48, hdpi 72, xhdpi 96, xxhdpi 144, xxxhdpi 192
generate 48 48 "$ANDROID_OUT/mipmap-mdpi/ic_launcher.png"
generate 72 72 "$ANDROID_OUT/mipmap-hdpi/ic_launcher.png"
generate 96 96 "$ANDROID_OUT/mipmap-xhdpi/ic_launcher.png"
generate 144 144 "$ANDROID_OUT/mipmap-xxhdpi/ic_launcher.png"
generate 192 192 "$ANDROID_OUT/mipmap-xxxhdpi/ic_launcher.png"

# Play Store high-res icon
generate 512 512 "$OUT_DIR/playstore-icon-512.png"

# Android splash/logo images (fullscreen portrait, no padding)
# Generated from SPLASH_SRC scaled to portrait dimensions for each density
SPLASH_OUT="$ANDROID_OUT"
mkdir -p "$SPLASH_OUT/drawable-mdpi" "$SPLASH_OUT/drawable-hdpi" \
  "$SPLASH_OUT/drawable-xhdpi" "$SPLASH_OUT/drawable-xxhdpi" \
  "$SPLASH_OUT/drawable-xxxhdpi" "$SPLASH_OUT/drawable"

# Portrait dimensions (9:16 aspect ratio) for common screen densities
# mdpi 320x569, hdpi 480x854, xhdpi 640x1138, xxhdpi 960x1707, xxxhdpi 1280x2276
generate_splash 320 569 "$SPLASH_OUT/drawable-mdpi/splashscreen_logo.png"
generate_splash 480 854 "$SPLASH_OUT/drawable-hdpi/splashscreen_logo.png"
generate_splash 640 1138 "$SPLASH_OUT/drawable-xhdpi/splashscreen_logo.png"
generate_splash 960 1707 "$SPLASH_OUT/drawable-xxhdpi/splashscreen_logo.png"
generate_splash 1280 2276 "$SPLASH_OUT/drawable-xxxhdpi/splashscreen_logo.png"

# Also generate a default (unqualified) drawable copy
generate_splash 640 1138 "$SPLASH_OUT/drawable/splashscreen_logo.png"

# iOS AppIcon.appiconset
IOS_OUT="$OUT_DIR/ios/AppIcon.appiconset"
mkdir -p "$IOS_OUT"

# List of iOS icon entries: size (pt), scales
# We'll generate the expanded pixel sizes and a Contents.json
# Sizes and scales based on common iOS AppIcon requirements
IOS_SIZES=$(cat <<'EOF'
20 1
20 2
20 3
29 1
29 2
29 3
40 1
40 2
40 3
60 2
60 3
76 1
76 2
83.5 2
1024 1
EOF
)

# Generate images and prepare Contents.json image array
IMAGES_JSON="[]"
IMAGES_JSON="["
while read -r pt scale; do
  # skip empty
  [ -z "$pt" ] && continue
  # convert pt possibly fractional (e.g., 83.5)
  # pixel size = pt * scale
  # Use bc for float math
  pixelf=$(echo "$pt * $scale" | bc -l)
  # Round to nearest integer
  pixel=$(printf "%.0f" "$pixelf")
  # Construct filename
  # For 1024 keep name as "icon-1024.png"
  if [ "$pt" = "1024" ]; then
    filename="icon-1024.png"
  else
    # Replace decimal point in pt for filenames
    ptkey=$(echo "$pt" | sed 's/\./p/')
    filename="icon-${ptkey}@${scale}x.png"
  fi
  outpath="$IOS_OUT/$filename"
  echo "- Generating iOS icon ${filename} (${pixel}x${pixel})"
  generate $pixel $pixel "$outpath"

  # Add to images JSON array entries
  if [ "$pt" = "1024" ]; then
    size_str="1024x1024"
    idiom="ios-marketing"
    scale_str="1x"
    role=""
  else
    size_str="${pt}x${pt}"
    idiom="iphone"
    scale_str="${scale}x"
  fi

  images_entry="{\"size\": \"${size_str}\", \"idiom\": \"${idiom}\", \"filename\": \"${filename}\", \"scale\": \"${scale_str}\"}"
  IMAGES_JSON+="$images_entry,"

done <<< "$IOS_SIZES"

# Trim trailing comma and close JSON
IMAGES_JSON=${IMAGES_JSON%,}
IMAGES_JSON+="]"

cat > "$IOS_OUT/Contents.json" <<JSON
{
  "images": $IMAGES_JSON,
  "info": {
    "version": 1,
    "author": "xcode"
  }
}
JSON

# Favicons and web app icons
FAV_OUT="$OUT_DIR/favicons"
mkdir -p "$FAV_OUT"

# sizes: 16, 32, 48, 180 (apple-touch), 192 (android-chrome), 512 (pwa)
generate 16 16 "$FAV_OUT/favicon-16.png"
generate 32 32 "$FAV_OUT/favicon-32.png"
generate 48 48 "$FAV_OUT/favicon-48.png"
generate 180 180 "$FAV_OUT/apple-touch-icon.png"
generate 192 192 "$FAV_OUT/android-chrome-192x192.png"
generate 512 512 "$FAV_OUT/android-chrome-512x512.png"

# Optionally create multi-resolution favicon.ico using ImageMagick's convert if available
if command -v convert >/dev/null 2>&1; then
  echo "ImageMagick found: creating multi-resolution favicon.ico"
  convert "$FAV_OUT/favicon-16.png" "$FAV_OUT/favicon-32.png" "$FAV_OUT/favicon-48.png" "$FAV_OUT/favicon-16.png" "$OUT_DIR/favicon.ico"
else
  echo "ImageMagick convert not found — skipping .ico generation. You can create favicon.ico with:"
  echo "  convert $FAV_OUT/favicon-16.png $FAV_OUT/favicon-32.png $FAV_OUT/favicon-48.png $OUT_DIR/favicon.ico"
fi

# Summary
echo "Done. Generated icons in:"
echo "  Android mipmaps: $ANDROID_OUT/*"
echo "  iOS appiconset: $IOS_OUT"
echo "  Favicons: $FAV_OUT (and $OUT_DIR/favicon.ico if created)"
echo "  Splash images: $SPLASH_OUT/*"

exit 0
