import { Platform } from 'react-native';

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
}

const scheme = required('EXPO_PUBLIC_API_SCHEME', 'http');
const hostRaw = required('EXPO_PUBLIC_API_HOST', 'localhost');
const port = required('EXPO_PUBLIC_API_PORT', '5000');
const version = required('EXPO_PUBLIC_API_VERSION', 'v1');

function resolveHost(host: string): string {
  if (
    Platform.OS === 'android' &&
    (host === 'localhost' || host === '127.0.0.1')
  ) {
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
