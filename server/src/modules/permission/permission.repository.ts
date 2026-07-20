import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListPermissionsFilters } from './permission.types';
import type {
  CreatePermissionInput,
  UpdatePermissionInput,
} from './permission.validation';

export const findById = (id: string) => {
  return prisma.permission.findUnique({
    where: { id },
  });
};

export const findBySlug = (slug: string) => {
  return prisma.permission.findUnique({
    where: { slug },
  });
};

export const findByIds = (ids: string[]) => {
  return prisma.permission.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};

export const findMany = (
  filters: ListPermissionsFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(filters);

  return prisma.$transaction([
    prisma.permission.findMany({
      where,
      skip,
      take,
      orderBy: [{ module: 'asc' }, { slug: 'asc' }],
    }),
    prisma.permission.count({ where }),
  ]);
};

export const create = (payload: CreatePermissionInput) => {
  const data: Prisma.PermissionCreateInput = {
    name: payload.name,
    slug: payload.slug,
    module: payload.module,
    isSystem: false,
  };

  if (payload.description !== undefined) {
    data.description = payload.description;
  }

  return prisma.permission.create({ data });
};

export const update = (id: string, payload: UpdatePermissionInput) => {
  const data: Prisma.PermissionUpdateInput = {};

  if (payload.name !== undefined) {
    data.name = payload.name;
  }

  if (payload.description !== undefined) {
    data.description = payload.description;
  }

  if (payload.module !== undefined) {
    data.module = payload.module;
  }

  return prisma.permission.update({
    where: { id },
    data,
  });
};

export const remove = (id: string) => {
  return prisma.permission.delete({
    where: { id },
  });
};

export const countRoleAssignments = (permissionId: string) => {
  return prisma.rolePermission.count({
    where: { permissionId },
  });
};

export const findRoleById = (roleId: string) => {
  return prisma.role.findUnique({
    where: { id: roleId },
  });
};

export const findPermissionsByRoleId = (roleId: string) => {
  return prisma.permission.findMany({
    where: {
      rolePermissions: {
        some: { roleId },
      },
    },
    orderBy: [{ module: 'asc' }, { slug: 'asc' }],
  });
};

export const syncRolePermissions = async (
  roleId: string,
  permissionIds: string[],
) => {
  return prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: { roleId },
    });

    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.permission.findMany({
      where: {
        rolePermissions: {
          some: { roleId },
        },
      },
      orderBy: [{ module: 'asc' }, { slug: 'asc' }],
    });
  });
};

export const findPermissionSlugsByRoleId = async (roleId: string) => {
  const rows = await prisma.rolePermission.findMany({
    where: { roleId },
    select: {
      permission: {
        select: {
          slug: true,
        },
      },
    },
  });

  return rows.map((row) => row.permission.slug);
};

const buildWhere = (
  filters: ListPermissionsFilters,
): Prisma.PermissionWhereInput => {
  const where: Prisma.PermissionWhereInput = {};

  if (filters.module) {
    where.module = filters.module;
  }

  if (filters.isSystem !== undefined) {
    where.isSystem = filters.isSystem;
  }

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        slug: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        module: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  return where;
};
