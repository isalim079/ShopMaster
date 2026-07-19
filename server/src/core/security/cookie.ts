import { CookieOptions } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes
const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

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