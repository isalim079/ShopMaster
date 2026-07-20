import { Prisma } from '@prisma/client';

import * as repository from './role.repository';
import { toRoleListResponse, toRoleResponse } from './role.mapper';
import type {
  CreateRoleInput,
  ListRolesQuery,
  UpdateRoleInput,
} from './role.validation';
import type { ListRolesResult } from './role.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';

export const createRole = async (payload: CreateRoleInput) => {
  const existing = await repository.findBySlug(payload.slug);

  if (existing) {
    throw new AppError(
      'Role slug already exists.',
      HTTP_STATUS.CONFLICT,
    );
  }

  try {
    const role = await repository.create(payload);
    return toRoleResponse(role);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new AppError(
        'Role slug already exists.',
        HTTP_STATUS.CONFLICT,
      );
    }

    throw error;
  }
};

export const getRoles = async (
  query: ListRolesQuery,
): Promise<ListRolesResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    isSystem?: boolean;
  } = {};

  if (query.search) {
    filters.search = query.search;
  }

  if (query.isSystem !== undefined) {
    filters.isSystem = query.isSystem;
  }

  const [roles, total] = await repository.findMany(
    filters,
    skip,
    limit,
  );

  return {
    roles: toRoleListResponse(roles),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getRoleById = async (id: string) => {
  const role = await repository.findById(id);

  if (!role) {
    throw new AppError('Role not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toRoleResponse(role);
};

export const updateRole = async (
  id: string,
  payload: UpdateRoleInput,
) => {
  const role = await repository.findById(id);

  if (!role) {
    throw new AppError('Role not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const updated = await repository.update(id, payload);
  return toRoleResponse(updated);
};

export const deleteRole = async (id: string) => {
  const role = await repository.findById(id);

  if (!role) {
    throw new AppError('Role not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (role.isSystem) {
    throw new AppError(
      'System roles cannot be deleted.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const userCount = await repository.countUsersByRoleId(id);

  if (userCount > 0) {
    throw new AppError(
      'Cannot delete role assigned to users.',
      HTTP_STATUS.CONFLICT,
    );
  }

  await repository.remove(id);

  return {
    message: 'Role deleted successfully.',
  };
};
