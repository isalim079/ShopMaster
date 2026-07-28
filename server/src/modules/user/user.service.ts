import { Prisma, UserStatus } from '@prisma/client';

import * as repository from './user.repository';
import { toUserListResponse, toUserResponse } from './user.mapper';
import type {
  ChangePasswordInput,
  CreateTeamMemberInput,
  ListUsersQuery,
  UpdateProfileInput,
} from './user.validation';
import type { ListUsersResult } from './user.types';
import { revokeAllUserTokens } from '../auth/auth.repository';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { comparePassword, hashPassword } from '../../core/security/bcrypt';
import {
  canSelfManagePassword,
  isTeamAssignableRole,
  ROLE_SLUG,
} from '../../core/constants/roles';
import { sendMail } from '../../core/mail/mail.service';
import { buildTeamMemberInviteEmail } from '../../core/mail/templates';
import { prisma } from '../../core/database';

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
  actorRoleSlug: string,
) => {
  if (!canSelfManagePassword(actorRoleSlug)) {
    throw new AppError(
      'Password changes are managed by your shop admin. Please contact them for help.',
      HTTP_STATUS.FORBIDDEN,
      { code: 'PASSWORD_CHANGE_ADMIN_ONLY' },
    );
  }

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
  organizationId: string,
  actorRoleSlug: string,
): Promise<ListUsersResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    organizationId?: string;
    search?: string;
    roleId?: string;
    roleSlug?: string;
    status?: UserStatus;
  } = {};

  // Shop admins only see their own organization team
  if (actorRoleSlug !== ROLE_SLUG.SUPER_ADMIN) {
    filters.organizationId = organizationId;
  }

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

export const createTeamMember = async (
  actor: {
    id: string;
    organizationId: string;
    role: string;
  },
  payload: CreateTeamMemberInput,
) => {
  if (
    actor.role !== ROLE_SLUG.ADMIN &&
    actor.role !== ROLE_SLUG.SUPER_ADMIN
  ) {
    throw new AppError(
      'Only shop admins can add team members.',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  if (!isTeamAssignableRole(payload.roleSlug)) {
    throw new AppError(
      'You can only create manager or employee accounts.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const existing = await repository.findByEmail(payload.email);
  if (existing) {
    throw new AppError(
      'Email already exists.',
      HTTP_STATUS.CONFLICT,
    );
  }

  const role = await repository.findRoleBySlug(payload.roleSlug);
  if (!role) {
    throw new AppError(
      'Role is not configured.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  const organization = await prisma.organization.findUnique({
    where: { id: actor.organizationId },
    select: { id: true, name: true },
  });

  if (!organization) {
    throw new AppError(
      'Organization not found.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const hashedPassword = await hashPassword(payload.password);

  const createPayload: {
    firstName: string;
    email: string;
    password: string;
    roleId: string;
    organizationId: string;
    lastName?: string | null;
    phone?: string | null;
  } = {
    firstName: payload.firstName,
    email: payload.email,
    password: hashedPassword,
    roleId: role.id,
    organizationId: organization.id,
  };
  if (payload.lastName !== undefined) {
    createPayload.lastName = payload.lastName;
  }
  if (payload.phone !== undefined) {
    createPayload.phone = payload.phone;
  }

  const user = await repository.createTeamMember(createPayload);

  const inviteEmail = buildTeamMemberInviteEmail({
    firstName: user.firstName,
    email: user.email,
    temporaryPassword: payload.password,
    roleName: role.name,
    organizationName: organization.name,
  });

  await sendMail({
    to: user.email,
    subject: inviteEmail.subject,
    html: inviteEmail.html,
    text: inviteEmail.text,
  });

  return toUserResponse(user);
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
