import crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRES_IN_MINUTES = 10;

export const generateOtp = (): string => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;

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
    Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000,
  );
};