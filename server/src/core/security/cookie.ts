import { CookieOptions } from 'express';

import { env } from '../config/env';
import { parseDurationToMs } from '../utils/duration';

const isProduction = env.NODE_ENV === 'production';

const accessTokenMaxAge = parseDurationToMs(env.JWT_ACCESS_EXPIRES_IN);
const refreshTokenMaxAge = parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN);

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: accessTokenMaxAge,
  path: '/',
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: refreshTokenMaxAge,
  path: '/',
};

export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};
