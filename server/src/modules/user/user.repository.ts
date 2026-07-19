import { UserRole, UserStatus } from '@prisma/client';

import { prisma } from '../../core/database';
import { UpdateProfileInput } from './user.validation';

export const findById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const findMany = () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const updateProfile = (
  userId: string,
  payload: UpdateProfileInput,
) => {
  const data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  } = {};

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
  role: UserRole,
) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
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
  });
};

export const deleteUser = (userId: string) => {
  return prisma.user.delete({
    where: {
      id: userId,
    },
  });
};