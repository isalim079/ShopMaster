import jwt, { type SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import crypto from 'crypto';

import { JwtPayload, PasswordResetTokenPayload } from '../../modules/auth/auth.types';
import { env } from '../config/env';

const accessSecret = env.JWT_ACCESS_SECRET;
const refreshSecret = env.JWT_REFRESH_SECRET;
const passwordResetSecret = env.JWT_PASSWORD_RESET_SECRET;

const accessSignOptions: SignOptions = {
  expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue,
};

const refreshSignOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue,
};

const passwordResetSignOptions: SignOptions = {
  expiresIn: env.JWT_PASSWORD_RESET_EXPIRES_IN as StringValue,
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
