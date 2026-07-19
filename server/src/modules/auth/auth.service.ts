

import { hashPassword, comparePassword } from '../../core/security/bcrypt';
import {
  compareOtp,
  generateOtp,
  getOtpExpiry,
  hashOtp,
} from '../../core/security/otp';

import { sendMail } from '../../core/mail/mail.service';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { toUserResponse } from './auth.mapper';

import * as repository from './auth.repository';
import { generateAccessToken, generatePasswordResetToken, generateRefreshToken, hashToken, verifyPasswordResetToken, verifyRefreshToken } from '../../core/security/jwt';
import { JwtPayload, LoginResponse } from './auth.types';
import { UserStatus } from '@prisma/client';



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

export const verifyEmail = async (
  email: string,
  otp: string,
) => {
  const user = await repository.findUserByEmail(email);

  if (!user) {
    throw new AppError(
      'User not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const verification =
    await repository.getLatestEmailVerification(user.id);

  if (!verification) {
    throw new AppError(
      'Verification code not found.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (verification.verifiedAt) {
    throw new AppError(
      'Email already verified.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (verification.expiresAt < new Date()) {
    throw new AppError(
      'Verification code has expired.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const isValidOtp = compareOtp(
    otp,
    verification.otpHash,
  );

  if (!isValidOtp) {
    throw new AppError(
      'Invalid verification code.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  await repository.verifyEmail(
    verification.id,
    user.id,
  );

  return {
    message: 'Email verified successfully.',
  };
};

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const user = await repository.findUserByEmail(email);

  if (!user) {
    throw new AppError(
      'Invalid email or password.',
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  const passwordMatched = await comparePassword(
    password,
    user.password,
  );

  if (!passwordMatched) {
    throw new AppError(
      'Invalid email or password.',
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  if (!user.isEmailVerified) {
    throw new AppError(
      'Please verify your email first.',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(
      'Your account is inactive.',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const jwtPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  );

  await repository.saveRefreshToken(
    user.id,
    hashToken(refreshToken),
    expiresAt,
  );

  return {
    user: toUserResponse(user),
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export const refreshToken = async (
  refreshToken: string,
) => {
  const payload = verifyRefreshToken(refreshToken);

  const tokenHash = hashToken(refreshToken);

  const storedToken =
    await repository.findRefreshToken(tokenHash);

  if (
    !storedToken ||
    storedToken.revokedAt ||
    storedToken.expiresAt < new Date()
  ) {
    throw new AppError(
      'Invalid refresh token.',
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  if (storedToken.user.status !== UserStatus.ACTIVE) {
    throw new AppError(
      'Account is inactive.',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const jwtPayload: JwtPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  const newAccessToken =
    generateAccessToken(jwtPayload);

  const newRefreshToken =
    generateRefreshToken(jwtPayload);

  await repository.revokeRefreshToken(tokenHash);

  await repository.saveRefreshToken(
    payload.userId,
    hashToken(newRefreshToken),
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (
  refreshToken: string,
) => {
  const tokenHash = hashToken(refreshToken);

  const storedToken =
    await repository.findRefreshToken(tokenHash);

  if (!storedToken) {
    return {
      message: 'Logged out successfully.',
    };
  }

  if (!storedToken.revokedAt) {
    await repository.revokeRefreshToken(tokenHash);
  }

  return {
    message: 'Logged out successfully.',
  };
};

export const forgotPassword = async (
  email: string,
) => {
  const user = await repository.findUserByEmail(email);

  /**
   * Prevent email enumeration attacks.
   * Always return the same response.
   */
  if (!user) {
    return {
      message:
        'If the account exists, a password reset code has been sent.',
    };
  }

  if (user.status !== UserStatus.ACTIVE) {
    return {
      message:
        'If the account exists, a password reset code has been sent.',
    };
  }

  const otp = generateOtp();

  await repository.createPasswordReset(
    user.id,
    hashOtp(otp),
    getOtpExpiry(),
  );

  await sendMail({
    to: user.email,
    subject: 'Password Reset Code',
    html: `
      <h2>Password Reset</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    `,
  });

  return {
    message:
      'If the account exists, a password reset code has been sent.',
  };
};

export const verifyResetOtp = async (
  email: string,
  otp: string,
) => {
  const user = await repository.findUserByEmail(email);

  if (!user) {
    throw new AppError(
      'Invalid email or OTP.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const passwordReset =
    await repository.getLatestPasswordReset(
      user.id,
    );

  if (!passwordReset) {
    throw new AppError(
      'Invalid email or OTP.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (passwordReset.expiresAt < new Date()) {
    throw new AppError(
      'OTP has expired.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (
    !compareOtp(
      otp,
      passwordReset.otpHash,
    )
  ) {
    throw new AppError(
      'Invalid email or OTP.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const resetToken =
    generatePasswordResetToken({
      userId: user.id,
      email: user.email,
      type: 'password-reset',
    });

  await repository.markPasswordResetUsed(
    passwordReset.id,
  );

  return {
    resetToken,
  };
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string,
) => {
  const payload =
    verifyPasswordResetToken(resetToken);

  const user = await repository.findUserById(
    payload.userId,
  );

  if (!user) {
    throw new AppError(
      'User not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(
      'Account is inactive.',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const isSamePassword =
    await comparePassword(
      newPassword,
      user.password,
    );

  if (isSamePassword) {
    throw new AppError(
      'New password must be different from the current password.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const hashedPassword =
    await hashPassword(newPassword);

  await repository.updatePassword(
    user.id,
    hashedPassword,
  );

  await repository.revokeAllUserTokens(
    user.id,
  );

  return {
    message:
      'Password reset successfully. Please login again.',
  };
};

export const resendVerificationOtp = async (
  email: string,
) => {
  const user = await repository.findUserByEmail(email);

  /**
   * Prevent email enumeration attacks.
   */
  if (!user) {
    return {
      message:
        'If the account exists, a verification code has been sent.',
    };
  }

  if (user.isEmailVerified) {
    throw new AppError(
      'Email is already verified.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  await repository.deletePendingEmailVerifications(
    user.id,
  );

  const otp = generateOtp();

  await repository.createEmailVerification(
    user.id,
    hashOtp(otp),
    getOtpExpiry(),
  );

  await sendMail({
    to: user.email,
    subject: 'Verify Your Email',
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });

  return {
    message:
      'If the account exists, a verification code has been sent.',
  };
};