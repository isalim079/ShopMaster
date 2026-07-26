import { env } from '@/src/shared/config/env';

const PRODUCTION_FALLBACK =
  'Something went wrong. Please try again later.';

function isDevMode(): boolean {
  return __DEV__ || env.APP_ENV === 'development';
}

function extractRawMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return typeof error === 'string' ? error : undefined;
  }

  const err = error as {
    status?: number | string;
    data?: { message?: string; error?: string } | string;
    error?: string;
    message?: string;
  };

  if (typeof err.data === 'string' && err.data.trim()) {
    return err.data;
  }

  if (err.data && typeof err.data === 'object') {
    if (err.data.message?.trim()) return err.data.message;
    if (err.data.error?.trim()) return err.data.error;
  }

  if (err.error?.trim()) return err.error;
  if (err.message?.trim()) return err.message;

  return undefined;
}

function isNetworkFailure(error: unknown, raw?: string): boolean {
  const err = error as { status?: number | string } | null;
  if (
    err?.status === 'FETCH_ERROR' ||
    err?.status === 'TIMEOUT_ERROR' ||
    err?.status === 'CUSTOM_ERROR'
  ) {
    return true;
  }

  const message = (raw ?? '').toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch failed') ||
    message.includes('failed to connect') ||
    message.includes('connection refused') ||
    message.includes('connection exception') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('timed out') ||
    message.includes('timeout') ||
    message.includes('socket') ||
    message.includes('unreachable')
  );
}

/**
 * User-facing API/network error text.
 * - Production: safe generic / server business messages only (never stack, host, ports).
 * - Development: include technical detail + API base URL for network failures.
 */
export function getErrorMessage(
  error: unknown,
  fallback = PRODUCTION_FALLBACK,
): string {
  const raw = extractRawMessage(error);
  const err = error as { status?: number | string; data?: { message?: string } };
  const serverMessage =
    err?.data && typeof err.data === 'object' ? err.data.message?.trim() : undefined;

  // Prefer validated API business messages (4xx/5xx JSON envelope).
  if (typeof err?.status === 'number' && serverMessage) {
    return serverMessage;
  }

  if (isNetworkFailure(error, raw)) {
    if (isDevMode()) {
      const detail = raw?.trim() || 'Network request failed';
      return `${detail}\nAPI: ${env.API_BASE_URL}`;
    }
    return fallback;
  }

  if (serverMessage) {
    return serverMessage;
  }

  if (isDevMode() && raw) {
    return raw;
  }

  // Strip technical leakage in production even if somehow present.
  if (!isDevMode() && raw && isNetworkFailure(error, raw)) {
    return fallback;
  }

  if (!isDevMode()) {
    return fallback;
  }

  return raw?.trim() || fallback;
}
