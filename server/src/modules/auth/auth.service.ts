import { UserStatus } from '@prisma/client';

import { hashPassword, comparePassword } from '../../core/security/bcrypt';
import {
  compareOtp,
  generateOtp,
  getOtpExpiry,
  hashOtp,
} from '../../core/security/otp';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../core/security/jwt';
import { sendMail } from '../../core/mail/mail.service';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';

import * as repository from './auth.repository';
import {
  LoginResponse,
  JwtPayload,
  RefreshTokenPayload,
} from './auth.types';

export const register = async (payload: {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}) => {
  const existingUser = await repository.findUserByEmail(payload.email);

  if (existingUser) {
    throw new AppError(
      'Email already exists.',
      HTTP_STATUS.CONFLICT,
    );
  }

  const hashedPassword = await hashPassword(payload.password);

  const user = await repository.createUser({
    ...payload,
    password: hashedPassword,
  });

  const otp = generateOtp();

  await repository.createEmailVerification(
    user.id,
    hashOtp(otp),
    getOtpExpiry(),
  );

  await sendMail({
    to: user.email,
    subject: 'Verify your email',
    html: `<h2>Your OTP is <b>${otp}</b></h2>`,
  });

  return {
    message:
      'Registration successful. Please verify your email.',
  };
};