import { Platform } from 'react-native';
import Constants from 'expo-constants';

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing env: ${key}`);
  }
  return value.trim();
}

const scheme = required('EXPO_PUBLIC_API_SCHEME', 'http');
const hostRaw = required('EXPO_PUBLIC_API_HOST', 'localhost');
const portRaw = required('EXPO_PUBLIC_API_PORT', '5000');
const version = required('EXPO_PUBLIC_API_VERSION', 'v1');

if (!/^\d{2,5}$/.test(portRaw)) {
  throw new Error(
    `Invalid EXPO_PUBLIC_API_PORT="${portRaw}". Expected digits like 5000.`,
  );
}

const port = portRaw;

/**
 * Resolve API host for the current runtime.
 * - Explicit non-loopback host: used as-is (LAN IP / staging / prod).
 * - Android emulator + localhost: 10.0.2.2 (host loopback from AVD).
 * - Android physical + localhost: keep localhost (needs `adb reverse`) OR
 *   EXPO_PUBLIC_API_LAN_HOST when set.
 */
function resolveHost(host: string): string {
  if (host !== 'localhost' && host !== '127.0.0.1') {
    return host;
  }

  if (Platform.OS !== 'android') {
    return host;
  }

  const emulatorHost =
    process.env.EXPO_PUBLIC_API_ANDROID_EMULATOR_HOST?.trim() || '10.0.2.2';
  const lanHost = process.env.EXPO_PUBLIC_API_LAN_HOST?.trim();

  // Constants.isDevice === false → emulator/simulator
  const isPhysicalDevice = Constants.isDevice === true;

  if (!isPhysicalDevice) {
    return emulatorHost;
  }

  // Physical phone cannot reach 10.0.2.2. Prefer LAN IP, else localhost + adb reverse.
  if (lanHost) {
    return lanHost;
  }

  return host;
}

const host = resolveHost(hostRaw);
const portSegment =
  (scheme === 'https' && port === '443') ||
  (scheme === 'http' && port === '80')
    ? ''
    : `:${port}`;

export const env = {
  APP_ENV: required('EXPO_PUBLIC_APP_ENV', 'development') as
    | 'development'
    | 'staging'
    | 'production',
  API_SCHEME: scheme,
  API_HOST: host,
  API_PORT: port,
  API_VERSION: version,
  API_BASE_URL: `${scheme}://${host}${portSegment}/api/${version}`,
  API_ORIGIN: `${scheme}://${host}${portSegment}`,
} as const;

export type Env = typeof env;

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log(
    `[ShopMaster] API_BASE_URL=${env.API_BASE_URL} isDevice=${String(Constants.isDevice)}`,
  );
}
