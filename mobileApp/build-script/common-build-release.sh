#!/usr/bin/env bash
# Release APK/AAB — SDK via env (no android/local.properties).
# Signing credentials live OUTSIDE android/ so `expo prebuild --clean` cannot wipe them.
# Usage:
#   bash ./build-script/common-build-release.sh          # APK + AAB
#   bash ./build-script/common-build-release.sh apk      # APK only
#   bash ./build-script/common-build-release.sh aab      # AAB only
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CRED_DIR="$ROOT/credentials"
ENV_FILE="$CRED_DIR/keystore.env"
KEYSTORE_FILE="$CRED_DIR/release.keystore"
TARGET="${1:-both}"

export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

NDK_VERSION="27.1.12297006"
NDK_DIR="$ANDROID_HOME/ndk/$NDK_VERSION"

if [[ ! -d "$ANDROID_HOME" ]]; then
  echo "Android SDK not found: $ANDROID_HOME"
  echo "Set ANDROID_HOME in ~/.zshrc"
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
    echo "Install: sdkmanager --install \"ndk;$NDK_VERSION\""
    exit 1
  fi
fi

if [[ ! -d "$ROOT/android" ]]; then
  echo "android/ missing. Run first:"
  echo "  yarn prebuild:clean"
  exit 1
fi

mkdir -p "$CRED_DIR"

# Load secrets from credentials/keystore.env if present (never commit this file)
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "$ENV_FILE"
  set +a
fi

STORE_FILE="${SHOPMASTER_RELEASE_STORE_FILE:-$KEYSTORE_FILE}"
STORE_PASSWORD="${SHOPMASTER_RELEASE_STORE_PASSWORD:-}"
KEY_ALIAS="${SHOPMASTER_RELEASE_KEY_ALIAS:-shopmaster}"
KEY_PASSWORD="${SHOPMASTER_RELEASE_KEY_PASSWORD:-${STORE_PASSWORD}}"

# Resolve relative store path from project root (not CWD)
if [[ "$STORE_FILE" != /* ]]; then
  STORE_FILE="$ROOT/${STORE_FILE#./}"
fi

if [[ ! -f "$STORE_FILE" ]]; then
  echo "No release keystore at: $STORE_FILE"
  echo "Generate one (keep passwords safe):"
  echo "  keytool -genkeypair -v -storetype PKCS12 \\"
  echo "    -keystore $KEYSTORE_FILE \\"
  echo "    -alias $KEY_ALIAS -keyalg RSA -keysize 2048 -validity 10000"
  echo "Then create $ENV_FILE from credentials/keystore.env.example"
  exit 1
fi

if [[ -z "$STORE_PASSWORD" || -z "$KEY_PASSWORD" ]]; then
  echo "Missing SHOPMASTER_RELEASE_STORE_PASSWORD / KEY_PASSWORD"
  echo "Put them in $ENV_FILE (see credentials/keystore.env.example)"
  exit 1
fi

# Patch Expo-generated build.gradle with release signing (re-applied every build;
# android/ is wiped by prebuild so this must stay in the script).
BUILD_GRADLE="$ROOT/android/app/build.gradle"
python3 - "$BUILD_GRADLE" <<'PY'
import pathlib, re, sys

path = pathlib.Path(sys.argv[1])
text = path.read_text()

release_signing = """
        release {
            storeFile file(System.getenv("SHOPMASTER_RELEASE_STORE_FILE"))
            storePassword System.getenv("SHOPMASTER_RELEASE_STORE_PASSWORD")
            keyAlias System.getenv("SHOPMASTER_RELEASE_KEY_ALIAS")
            keyPassword System.getenv("SHOPMASTER_RELEASE_KEY_PASSWORD")
        }
"""

if "keyAlias System.getenv(\"SHOPMASTER_RELEASE_KEY_ALIAS\")" not in text:
    text = re.sub(
        r"(signingConfigs \{[\s\S]*?debug \{[\s\S]*?\n        \}\n)(    \})",
        r"\1" + release_signing + r"\2",
        text,
        count=1,
    )

text = re.sub(
    r"(release \{[\s\S]*?)signingConfig signingConfigs\.debug",
    r"\1signingConfig signingConfigs.release",
    text,
    count=1,
)

path.write_text(text)
print(f"Patched release signing: {path}")
PY

export SHOPMASTER_RELEASE_STORE_FILE="$STORE_FILE"
export SHOPMASTER_RELEASE_STORE_PASSWORD="$STORE_PASSWORD"
export SHOPMASTER_RELEASE_KEY_ALIAS="$KEY_ALIAS"
export SHOPMASTER_RELEASE_KEY_PASSWORD="$KEY_PASSWORD"

cd "$ROOT/android"
./gradlew clean
echo "Gradle cleaned"

case "$TARGET" in
  apk)
    ./gradlew assembleRelease
    ;;
  aab)
    ./gradlew bundleRelease
    ;;
  both)
    ./gradlew assembleRelease bundleRelease
    ;;
  *)
    echo "Unknown target: $TARGET (use apk | aab | both)"
    exit 1
    ;;
esac

echo "Build completed"

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
AAB="$ROOT/android/app/build/outputs/bundle/release/app-release.aab"
OK=0

if [[ "$TARGET" == "apk" || "$TARGET" == "both" ]]; then
  if [[ -f "$APK" ]]; then
    echo "APK: $APK"
    OK=1
  else
    echo "APK missing"
  fi
fi

if [[ "$TARGET" == "aab" || "$TARGET" == "both" ]]; then
  if [[ -f "$AAB" ]]; then
    echo "AAB: $AAB"
    OK=1
  else
    echo "AAB missing"
  fi
fi

if [[ "$OK" -ne 1 ]]; then
  exit 1
fi
