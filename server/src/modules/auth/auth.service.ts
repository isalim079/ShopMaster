
import { UserStatus } from '@prisma/client';

import { env } from '../../core/config/env';
import { hashPassword, comparePassword } from '../../core/security/bcrypt';
import {
  compareOtp,
  generateOtp,
  getOtpExpiry,
  hashOtp,
} from '../../core/security/otp';
import { sendMail } from '../../core/mail/mail.service';
import {
  buildEmailVerificationEmail,
  buildPasswordChangedEmail,
  buildPasswordResetEmail,
} from '../../core/mail/templates';
import { AppError } from '../../core/errors/app-error';
import { canSelfManagePassword } from '../../core/constants/roles';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { getExpiryDateFromDuration } from '../../core/utils/duration';
import {
  generateAccessToken,
  generatePasswordResetToken,
  generateRefreshToken,
  hashToken,
  verifyPasswordResetToken,
  verifyRefreshToken,
} from '../../core/security/jwt';
import { toUserResponse } from './auth.mapper';
import * as repository from './auth.repository';
import { JwtPayload, LoginResponse } from './auth.types';



export const register = async (payload: {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  organizationName: string;
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

  const verificationEmail = buildEmailVerificationEmail({
    firstName: user.firstName,
    otp,
    expiryMinutes: env.OTP_EXPIRY_MINUTES,
  });

  await sendMail({
    to: user.email,
    subject: verificationEmail.subject,
    html: verificationEmail.html,
    text: verificationEmail.text,
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

  if (user.organization.status !== 'ACTIVE') {
    throw new AppError(
      'Your organization is inactive.',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const jwtPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role.slug,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  await repository.saveRefreshToken(
    user.id,
    hashToken(refreshToken),
    getExpiryDateFromDuration(env.JWT_REFRESH_EXPIRES_IN),
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
    getExpiryDateFromDuration(env.JWT_REFRESH_EXPIRES_IN),
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
  const normalized = email.trim().toLowerCase();
  const user = await repository.findUserByEmail(normalized);

  // Explicit not-found for product UX. Mitigate abuse via route rate limit.
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND, {
      code: 'USER_NOT_FOUND',
    });
  }

  // Managers / employees cannot self-reset — shop admin must reset for them
  if (!canSelfManagePassword(user.role.slug)) {
    throw new AppError(
      'Password reset is managed by your shop admin. Please contact them for help.',
      HTTP_STATUS.FORBIDDEN,
      { code: 'PASSWORD_RESET_ADMIN_ONLY' },
    );
  }

  const otp = generateOtp();

  await repository.createPasswordReset(
    user.id,
    hashOtp(otp),
    getOtpExpiry(),
  );

  const resetEmail = buildPasswordResetEmail({
    firstName: user.firstName,
    otp,
    expiryMinutes: env.OTP_EXPIRY_MINUTES,
  });

  await sendMail({
    to: user.email,
    subject: resetEmail.subject,
    html: resetEmail.html,
    text: resetEmail.text,
  });

  return {
    message: 'Password reset code sent to your email.',
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

  if (!canSelfManagePassword(user.role.slug)) {
    throw new AppError(
      'Password reset is managed by your shop admin. Please contact them for help.',
      HTTP_STATUS.FORBIDDEN,
      { code: 'PASSWORD_RESET_ADMIN_ONLY' },
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

  if (!canSelfManagePassword(user.role.slug)) {
    throw new AppError(
      'Password reset is managed by your shop admin. Please contact them for help.',
      HTTP_STATUS.FORBIDDEN,
      { code: 'PASSWORD_RESET_ADMIN_ONLY' },
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

  const changedEmail = buildPasswordChangedEmail({
    firstName: user.firstName,
    email: user.email,
  });

  await sendMail({
    to: user.email,
    subject: changedEmail.subject,
    html: changedEmail.html,
    text: changedEmail.text,
  });

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

  const verificationEmail = buildEmailVerificationEmail({
    firstName: user.firstName,
    otp,
    expiryMinutes: env.OTP_EXPIRY_MINUTES,
  });

  await sendMail({
    to: user.email,
    subject: verificationEmail.subject,
    html: verificationEmail.html,
    text: verificationEmail.text,
  });

  return {
    message:
      'If the account exists, a verification code has been sent.',
  };
};