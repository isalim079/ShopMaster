import jwt, { type SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';

import { JwtPayload } from '../../modules/auth/auth.types';
import { env } from '../config/env';

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
