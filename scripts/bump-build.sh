#!/bin/bash
# scripts/bump-build.sh
set -euo pipefail

DRY_RUN=0
while [[ ${1:-} != "" ]]; do
	case "$1" in
		--dry-run|-n)
			DRY_RUN=1
			shift
			;;
		--help|-h)
			echo "Usage: $0 [--dry-run]" >&2
			exit 0
			;;
		*)
			echo "Unknown arg: $1" >&2
			exit 2
			;;
	esac
done

write_or_preview() {
	src="$1"
	new="$2"
	if [ "$DRY_RUN" -eq 1 ]; then
		if [ -f "$src" ]; then
			echo "--- Preview diff for $src ---"
			diff -u "$src" "$new" || true
		else
			echo "--- Preview: $src would be created with contents: ---"
			sed -n '1,200p' "$new"
		fi
	else
		mv "$new" "$src"
	fi
}

# Build formats:
# - iOS buildNumber: YYYY.MM.DD.INCREMENT
# - Android versionCode: YYYYMMDDINCREMENT

TODAY_IOS=$(date +%Y.%m.%d)
TODAY_ANDROID=$(date +%Y%m%d)

IOS_CURRENT=$(jq -r '.expo.ios.buildNumber // empty' app.json || echo "")
ANDROID_CURRENT=$(jq -r '.expo.android.versionCode // empty' app.json || echo "")

IOS_DATE=""
IOS_INC=0
if [[ $IOS_CURRENT =~ ^([0-9]{4}\.[0-9]{2}\.[0-9]{2})\.([0-9]+)$ ]]; then
	IOS_DATE="${BASH_REMATCH[1]}"
	IOS_INC=${BASH_REMATCH[2]}
fi

if [ "$IOS_DATE" = "$TODAY_IOS" ]; then
	NEW_IOS_INC=$((IOS_INC + 1))
else
	NEW_IOS_INC=1
fi
NEW_IOS_BUILD="${TODAY_IOS}.${NEW_IOS_INC}"

ANDROID_DATE=""
ANDROID_INC=0
if [[ $ANDROID_CURRENT =~ ^([0-9]{8})([0-9]+)$ ]]; then
	ANDROID_DATE="${BASH_REMATCH[1]}"
	ANDROID_INC=${BASH_REMATCH[2]}
fi

if [ "$ANDROID_DATE" = "$TODAY_ANDROID" ]; then
    NEW_ANDROID_INC=$((ANDROID_INC + 1))
else
    NEW_ANDROID_INC=1
fi

# Ensure increment is always 2 digits: 01, 02, 03...
NEW_ANDROID_INC=$(printf "%02d" "$NEW_ANDROID_INC")
NEW_ANDROID_VERSION="${TODAY_ANDROID}${NEW_ANDROID_INC}"

echo "Bumping versions to:" 
echo "  iOS buildNumber:     $NEW_IOS_BUILD"
echo "  Android versionCode: $NEW_ANDROID_VERSION"

new=$(mktemp)
jq \
  --arg ios "$NEW_IOS_BUILD" \
  --arg android "$NEW_ANDROID_VERSION" \
  '
    .expo.ios     = (.expo.ios // {}) |
    .expo.android = (.expo.android // {}) |
    .expo.ios.buildNumber         = $ios |
    .expo.android.versionCode     = ($android | tonumber)
  ' app.json > "$new"
write_or_preview app.json "$new"

if [ -f ios/KooM/Info.plist ]; then
	new=$(mktemp)
	perl -0777 -pe \
	  "s|(<key>CFBundleVersion</key>\s*<string>)[^<]*(</string>)|\${1}$NEW_IOS_BUILD\${2}|g" \
	  ios/KooM/Info.plist > "$new"
	write_or_preview ios/KooM/Info.plist "$new"
fi

if [ -f ios/KooM.xcodeproj/project.pbxproj ]; then
	new=$(mktemp)
	perl -0777 -pe \
	  "s|(CURRENT_PROJECT_VERSION\s*=\s*)[^;]+;|\${1}$NEW_IOS_BUILD;|g" \
	  ios/KooM.xcodeproj/project.pbxproj > "$new"
	write_or_preview ios/KooM.xcodeproj/project.pbxproj "$new"
fi

if [ -f android/app/build.gradle ]; then
	new=$(mktemp)
	perl -0777 -pe \
	  "s|(versionCode\s+)\d+|\${1}$NEW_ANDROID_VERSION|g" \
	  android/app/build.gradle > "$new"
	write_or_preview android/app/build.gradle "$new"
fi

if [ -f README.md ]; then
	new=$(mktemp)
	perl -0777 -pe \
	  "s|^\|\s*iOS\b.*$|\| iOS      \| 1.0.0   \| $NEW_IOS_BUILD \||m" \
	  README.md > "$new"
	write_or_preview README.md "$new"

	new=$(mktemp)
	perl -0777 -pe \
	  "s|^\|\s*Android\b.*$|\| Android  \| 1.0.0   \| $NEW_ANDROID_VERSION \||m" \
	  README.md > "$new"
	write_or_preview README.md "$new"
fi

echo "Updated files: app.json"
[ -f ios/KooM/Info.plist ] && echo " - ios/KooM/Info.plist"
[ -f ios/KooM.xcodeproj/project.pbxproj ] && echo " - ios/KooM.xcodeproj/project.pbxproj"
[ -f android/app/build.gradle ] && echo " - android/app/build.gradle"

chmod +x scripts/bump-build.sh || true

echo "Done."
