import { UserRole, UserStatus } from '@prisma/client';

import * as repository from './user.repository';
import { toUserListResponse, toUserResponse } from './user.mapper';
import {
  ChangePasswordInput,
  UpdateProfileInput,
} from './user.validation';

import { revokeAllUserTokens } from '../auth/auth.repository';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { comparePassword, hashPassword } from '../../core/security/bcrypt';

export const getMe = async (userId: string) => {
  const user = await repository.findById(userId);

  if (!user) {
    throw new AppError(
      'User not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  return toUserResponse(user);
};

export const updateProfile = async (
  userId: string,
  payload: UpdateProfileInput,
) => {
  const user = await repository.findById(userId);

  if (!user) {
    throw new AppError(
      'User not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const updatedUser = await repository.updateProfile(
    userId,
    payload,
  );

  return toUserResponse(updatedUser);
};

export const changePassword = async (
  userId: string,
  payload: ChangePasswordInput,
) => {
  const user = await repository.findById(userId);

  if (!user) {
    throw new AppError(
      'User not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const isPasswordMatched = await comparePassword(
    payload.currentPassword,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(
      'Current password is incorrect.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const isSamePassword = await comparePassword(
    payload.newPassword,
    user.password,
  );

  if (isSamePassword) {
    throw new AppError(
      'New password must be different from the current password.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const hashedPassword = await hashPassword(
    payload.newPassword,
  );

  await repository.updatePassword(
    userId,
    hashedPassword,
  );

  await revokeAllUserTokens(userId);

  return {
    message:
      'Password changed successfully. Please login again.',
  };
};

export const getUsers = async () => {
  const users = await repository.findMany();

  return toUserListResponse(users);
};

export const updateUserRole = async (
  userId: string,
  role: UserRole,
) => {
  const user = await repository.findById(userId);

  if (!user) {
    throw new AppError(
      'User not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const updatedUser = await repository.updateRole(
    userId,
    role,
  );

  return toUserResponse(updatedUser);
};

export const updateUserStatus = async (
  userId: string,
  status: UserStatus,
) => {
  const user = await repository.findById(userId);

  if (!user) {
    throw new AppError(
      'User not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const updatedUser = await repository.updateStatus(
    userId,
    status,
  );

  await revokeAllUserTokens(userId);

  return toUserResponse(updatedUser);
};

export const deleteUser = async (
  userId: string,
) => {
  const user = await repository.findById(userId);

  if (!user) {
    throw new AppError(
      'User not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  await repository.deleteUser(userId);

  return {
    message: 'User deleted successfully.',
  };
};