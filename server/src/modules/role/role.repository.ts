import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListRolesFilters } from './role.types';
import type { CreateRoleInput, UpdateRoleInput } from './role.validation';

export const findById = (id: string) => {
  return prisma.role.findUnique({
    where: { id },
  });
};

export const findBySlug = (slug: string) => {
  return prisma.role.findUnique({
    where: { slug },
  });
};

export const findMany = (
  filters: ListRolesFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(filters);

  return prisma.$transaction([
    prisma.role.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.role.count({ where }),
  ]);
};

export const create = (payload: CreateRoleInput) => {
  const data: Prisma.RoleCreateInput = {
    name: payload.name,
    slug: payload.slug,
    isSystem: false,
  };

  if (payload.description !== undefined) {
    data.description = payload.description;
  }

  return prisma.role.create({
    data,
  });
};

export const update = (id: string, payload: UpdateRoleInput) => {
  const data: Prisma.RoleUpdateInput = {};

  if (payload.name !== undefined) {
    data.name = payload.name;
  }

  if (payload.description !== undefined) {
    data.description = payload.description;
  }

  return prisma.role.update({
    where: { id },
    data,
  });
};

export const remove = (id: string) => {
  return prisma.role.delete({
    where: { id },
  });
};

export const countUsersByRoleId = (roleId: string) => {
  return prisma.user.count({
    where: { roleId },
  });
};

const buildWhere = (
  filters: ListRolesFilters,
): Prisma.RoleWhereInput => {
  const where: Prisma.RoleWhereInput = {};

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
        description: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  return where;
};
