import { Prisma, UserStatus } from '@prisma/client';

import { prisma } from '../../core/database';
import type { UpdateProfileInput } from './user.validation';
import type { ListUsersFilters } from './user.types';

const userWithRole = {
  role: true,
} satisfies Prisma.UserInclude;

export const findById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: userWithRole,
  });
};

export const findMany = (
  filters: ListUsersFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(filters);

  return prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take,
      include: userWithRole,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count({ where }),
  ]);
};

export const updateProfile = (
  userId: string,
  payload: UpdateProfileInput,
) => {
  const data: Prisma.UserUpdateInput = {};

  if (payload.firstName !== undefined) {
    data.firstName = payload.firstName;
  }

  if (payload.lastName !== undefined) {
    data.lastName = payload.lastName;
  }

  if (payload.phone !== undefined) {
    data.phone = payload.phone;
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data,
    include: userWithRole,
  });
};

export const updatePassword = (
  userId: string,
  password: string,
) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password,
    },
  });
};

export const updateRole = (
  userId: string,
  roleId: string,
) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      roleId,
    },
    include: userWithRole,
  });
};

export const updateStatus = (
  userId: string,
  status: UserStatus,
) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
    include: userWithRole,
  });
};

export const deleteUser = (userId: string) => {
  return prisma.user.delete({
    where: {
      id: userId,
    },
  });
};

export const findRoleById = (roleId: string) => {
  return prisma.role.findUnique({
    where: { id: roleId },
  });
};

const buildWhere = (
  filters: ListUsersFilters,
): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = {};

  if (filters.roleId) {
    where.roleId = filters.roleId;
  }

  if (filters.roleSlug) {
    where.role = {
      slug: filters.roleSlug,
    };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      {
        firstName: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        lastName: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        phone: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  return where;
};
