import jwt, { type SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';

import { JwtPayload, PasswordResetTokenPayload } from '../../modules/auth/auth.types';
import { env } from '../config/env';
import crypto from 'crypto';

const accessSecret = env.JWT_ACCESS_SECRET as string;
const refreshSecret = env.JWT_REFRESH_SECRET as string;

const accessExpiresIn = (env.JWT_ACCESS_EXPIRES_IN ??
  '15m') as StringValue;
const refreshExpiresIn = (env.JWT_REFRESH_EXPIRES_IN ??
  '7d') as StringValue;

const accessSignOptions: SignOptions = {
  expiresIn: accessExpiresIn,
};
const refreshSignOptions: SignOptions = {
  expiresIn: refreshExpiresIn,
};

export const generateAccessToken = (
  payload: JwtPayload,
): string => {
  return jwt.sign(payload, accessSecret, accessSignOptions);
};

export const generateRefreshToken = (
  payload: JwtPayload,
): string => {
  return jwt.sign(payload, refreshSecret, refreshSignOptions);
};

export const verifyAccessToken = (
  token: string,
): JwtPayload => {
  return jwt.verify(token, accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (
  token: string,
): JwtPayload => {
  return jwt.verify(token, refreshSecret) as JwtPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const passwordResetSecret =
  process.env.JWT_PASSWORD_RESET_SECRET as string;

const passwordResetExpiresIn = (process.env
  .JWT_PASSWORD_RESET_EXPIRES_IN ?? '10m') as StringValue;

const passwordResetSignOptions: SignOptions = {
  expiresIn: passwordResetExpiresIn,
};

export const generatePasswordResetToken = (
  payload: PasswordResetTokenPayload,
): string => {
  return jwt.sign(
    payload,
    passwordResetSecret,
    passwordResetSignOptions,
  );
};

export const verifyPasswordResetToken = (
  token: string,
): PasswordResetTokenPayload => {
  return jwt.verify(
    token,
    passwordResetSecret,
  ) as PasswordResetTokenPayload;
};
