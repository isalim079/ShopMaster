#!/usr/bin/env bash
# Permanent Android SDK wiring — does NOT depend on android/local.properties
# (that file is wiped by `npx expo prebuild --clean`).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

NDK_VERSION="27.1.12297006"
NDK_DIR="$ANDROID_HOME/ndk/$NDK_VERSION"

if [[ ! -d "$ANDROID_HOME" ]]; then
  echo "Android SDK not found: $ANDROID_HOME"
  echo "Install SDK or set ANDROID_HOME in ~/.zshrc"
  exit 1
fi

echo "ANDROID_HOME=$ANDROID_HOME"

if [[ ! -f "$NDK_DIR/source.properties" ]]; then
  echo "NDK $NDK_VERSION missing or broken at $NDK_DIR"
  if [[ -x "$(command -v sdkmanager)" ]]; then
    echo "Installing NDK via sdkmanager..."
    rm -rf "$NDK_DIR"
    yes | sdkmanager --licenses >/dev/null 2>&1 || true
    sdkmanager --install "ndk;$NDK_VERSION"
  else
    echo "Install cmdline-tools + NDK, then retry:"
    echo "  sdkmanager --install \"ndk;$NDK_VERSION\""
    exit 1
  fi
fi

cd "$ROOT/android"
./gradlew clean
echo "Gradle cleaned"

./gradlew assembleDebug
echo "Build completed"

APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
if [[ -f "$APK" ]]; then
  echo "APK: $APK"
else
  echo "APK missing — build failed"
  exit 1
fi
