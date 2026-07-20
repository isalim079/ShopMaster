import crypto from 'crypto';

import { env } from '../config/env';

export const generateOtp = (): string => {
  const min = 10 ** (env.OTP_LENGTH - 1);
  const max = 10 ** env.OTP_LENGTH - 1;

  return crypto.randomInt(min, max + 1).toString();
};

export const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

export const compareOtp = (
  plainOtp: string,
  hashedOtp: string,
): boolean => {
  return hashOtp(plainOtp) === hashedOtp;
};

export const getOtpExpiry = (): Date => {
  return new Date(
    Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000,
  );
};
