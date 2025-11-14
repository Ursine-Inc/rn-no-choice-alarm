#!/bin/bash
# scripts/bump-build.sh
NEXT_BUILD=$(($(date +%Y%m%d)00))
jq ".expo.ios.buildNumber = \"$NEXT_BUILD.1\" | .expo.android.versionCode = $NEXT_BUILD" app.json > tmp.json && mv tmp.json app.json