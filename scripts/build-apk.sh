#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Baca versi sekarang
VERSION=$(node -p "require('./package.json').version")
MAJOR=$(echo "$VERSION" | cut -d. -f1)
MINOR=$(echo "$VERSION" | cut -d. -f2)
PATCH=$(echo "$VERSION" | cut -d. -f3)
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
VERSION_CODE=$((MAJOR * 10000 + MINOR * 100 + NEW_PATCH))

echo "=== Build APK FinansialKu v$NEW_VERSION ==="

# 1. Update package.json
node -e "
const pkg = require('./package.json');
pkg.version = '$NEW_VERSION';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# 2. Update android/app/build.gradle
sed -i "s/versionCode [0-9]*/versionCode $VERSION_CODE/" android/app/build.gradle
sed -i "s/versionName \"[^\"]*\"/versionName \"$NEW_VERSION\"/" android/app/build.gradle

# 3. Build Next.js
echo "--- Build Next.js ---"
bun run build

# 4. Sync Capacitor
echo "--- Sync Capacitor ---"
npx cap sync

# 5. Build APK
echo "--- Build APK ---"
cd android && ./gradlew assembleDebug
cd "$ROOT"

# 6. Copy APK ke public/
cp android/app/build/outputs/apk/debug/app-debug.apk "public/finansialku-$NEW_VERSION.apk"

echo ""
echo "=== Selesai! APK: public/finansialku-$NEW_VERSION.apk ==="
