import type { NextFunction, Request, Response } from 'express';

import { HTTP_STATUS } from '../constants/http-status';
import { AppError } from '../errors/app-error';

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  windowMs: number;
  max: number;
  /** Prefix for the bucket key. */
  keyPrefix: string;
  /**
   * Build rate-limit key. Default: IP + optional body.email.
   * Using email+IP slows account takeover / inbox flooding probes.
   */
  keyGenerator?: (req: Request) => string;
  message?: string;
};

const buckets = new Map<string, Bucket>();

function defaultKey(req: Request, prefix: string): string {
  const ip =
    (typeof req.ip === 'string' && req.ip) ||
    req.socket.remoteAddress ||
    'unknown';
  const email =
    typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';
  return `${prefix}:${ip}:${email}`;
}

/**
 * Lightweight in-memory rate limiter for sensitive auth routes.
 * Fine for single-node. Use Redis-backed limiter behind a load balancer.
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    keyPrefix,
    keyGenerator,
    message = 'Too many requests. Please try again later.',
  } = options;

  return (req: Request, _res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = keyGenerator
      ? `${keyPrefix}:${keyGenerator(req)}`
      : defaultKey(req, keyPrefix);

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      next(
        new AppError(message, HTTP_STATUS.TOO_MANY_REQUESTS, {
          code: 'RATE_LIMITED',
          retryAfterMs: Math.max(0, bucket.resetAt - now),
        }),
      );
      return;
    }

    next();
  };
}
