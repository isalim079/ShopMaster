import { Prisma, UserStatus } from '@prisma/client';

import * as repository from './user.repository';
import { toUserListResponse, toUserResponse } from './user.mapper';
import type {
  ChangePasswordInput,
  ListUsersQuery,
  UpdateProfileInput,
} from './user.validation';
import type { ListUsersResult } from './user.types';
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

  try {
    const updatedUser = await repository.updateProfile(
      userId,
      payload,
    );

    return toUserResponse(updatedUser);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new AppError(
        'Phone number already in use.',
        HTTP_STATUS.CONFLICT,
      );
    }

    throw error;
  }
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

export const getUsers = async (
  query: ListUsersQuery,
): Promise<ListUsersResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    roleId?: string;
    roleSlug?: string;
    status?: UserStatus;
  } = {};

  if (query.search) {
    filters.search = query.search;
  }

  if (query.roleId) {
    filters.roleId = query.roleId;
  }

  if (query.roleSlug) {
    filters.roleSlug = query.roleSlug;
  }

  if (query.status) {
    filters.status = query.status;
  }

  const [users, total] = await repository.findMany(
    filters,
    skip,
    limit,
  );

  return {
    users: toUserListResponse(users),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const updateUserRole = async (
  actorId: string,
  userId: string,
  roleId: string,
) => {
  if (actorId === userId) {
    throw new AppError(
      'You cannot change your own role.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const user = await repository.findById(userId);

  if (!user) {
    throw new AppError(
      'User not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const role = await repository.findRoleById(roleId);

  if (!role) {
    throw new AppError(
      'Role not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const updatedUser = await repository.updateRole(
    userId,
    roleId,
  );

  await revokeAllUserTokens(userId);

  return toUserResponse(updatedUser);
};

export const updateUserStatus = async (
  actorId: string,
  userId: string,
  status: UserStatus,
) => {
  if (actorId === userId) {
    throw new AppError(
      'You cannot change your own status.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

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
  actorId: string,
  userId: string,
) => {
  if (actorId === userId) {
    throw new AppError(
      'You cannot delete your own account.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

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
