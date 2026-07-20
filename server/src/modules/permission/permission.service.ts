import { Prisma } from '@prisma/client';

import * as repository from './permission.repository';
import {
  toPermissionListResponse,
  toPermissionResponse,
} from './permission.mapper';
import type {
  CreatePermissionInput,
  ListPermissionsQuery,
  SyncRolePermissionsInput,
  UpdatePermissionInput,
} from './permission.validation';
import type { ListPermissionsResult } from './permission.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { ROLE_SLUG } from '../../core/constants/roles';

export const createPermission = async (payload: CreatePermissionInput) => {
  const existing = await repository.findBySlug(payload.slug);

  if (existing) {
    throw new AppError(
      'Permission slug already exists.',
      HTTP_STATUS.CONFLICT,
    );
  }

  try {
    const permission = await repository.create(payload);
    return toPermissionResponse(permission);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new AppError(
        'Permission slug already exists.',
        HTTP_STATUS.CONFLICT,
      );
    }

    throw error;
  }
};

export const getPermissions = async (
  query: ListPermissionsQuery,
): Promise<ListPermissionsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    module?: string;
    isSystem?: boolean;
  } = {};

  if (query.search) {
    filters.search = query.search;
  }

  if (query.module) {
    filters.module = query.module;
  }

  if (query.isSystem !== undefined) {
    filters.isSystem = query.isSystem;
  }

  const [permissions, total] = await repository.findMany(
    filters,
    skip,
    limit,
  );

  return {
    permissions: toPermissionListResponse(permissions),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getPermissionById = async (id: string) => {
  const permission = await repository.findById(id);

  if (!permission) {
    throw new AppError('Permission not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toPermissionResponse(permission);
};

export const updatePermission = async (
  id: string,
  payload: UpdatePermissionInput,
) => {
  const permission = await repository.findById(id);

  if (!permission) {
    throw new AppError('Permission not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const updated = await repository.update(id, payload);
  return toPermissionResponse(updated);
};

export const deletePermission = async (id: string) => {
  const permission = await repository.findById(id);

  if (!permission) {
    throw new AppError('Permission not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (permission.isSystem) {
    throw new AppError(
      'System permissions cannot be deleted.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const assignmentCount = await repository.countRoleAssignments(id);

  if (assignmentCount > 0) {
    throw new AppError(
      'Cannot delete permission assigned to roles.',
      HTTP_STATUS.CONFLICT,
    );
  }

  await repository.remove(id);

  return {
    message: 'Permission deleted successfully.',
  };
};

export const getRolePermissions = async (roleId: string) => {
  const role = await repository.findRoleById(roleId);

  if (!role) {
    throw new AppError('Role not found.', HTTP_STATUS.NOT_FOUND);
  }

  const permissions = await repository.findPermissionsByRoleId(roleId);

  return toPermissionListResponse(permissions);
};

export const syncRolePermissions = async (
  roleId: string,
  payload: SyncRolePermissionsInput,
) => {
  const role = await repository.findRoleById(roleId);

  if (!role) {
    throw new AppError('Role not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (role.slug === ROLE_SLUG.SUPER_ADMIN) {
    throw new AppError(
      'Super Admin permissions are managed by the system.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const uniqueIds = [...new Set(payload.permissionIds)];

  if (uniqueIds.length > 0) {
    const found = await repository.findByIds(uniqueIds);

    if (found.length !== uniqueIds.length) {
      throw new AppError(
        'One or more permissions were not found.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  const permissions = await repository.syncRolePermissions(
    roleId,
    uniqueIds,
  );

  return toPermissionListResponse(permissions);
};
