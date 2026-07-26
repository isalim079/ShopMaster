import { Platform } from 'react-native';

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

function resolveHost(host: string): string {
  if (
    Platform.OS === 'android' &&
    (host === 'localhost' || host === '127.0.0.1')
  ) {
    // Android emulator → host machine loopback
    return '10.0.2.2';
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
  // Helps diagnose emulator/device networking without leaking in production UI.
  // eslint-disable-next-line no-console
  console.log(`[ShopMaster] API_BASE_URL=${env.API_BASE_URL}`);
}
