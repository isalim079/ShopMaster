import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { CreateNotificationInput } from './notification.validation';

export const findManyForUser = (
  organizationId: string,
  userId: string,
  filters: { isRead?: boolean },
  skip: number,
  take: number,
) => {
  const where: Prisma.NotificationWhereInput = {
    organizationId,
    OR: [{ userId }, { userId: null }],
  };

  if (filters.isRead !== undefined) {
    where.isRead = filters.isRead;
  }

  return prisma.$transaction([
    prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);
};

export const findById = (organizationId: string, id: string) => {
  return prisma.notification.findFirst({
    where: { id, organizationId },
  });
};

export const create = (
  organizationId: string,
  payload: CreateNotificationInput,
) => {
  return prisma.notification.create({
    data: {
      organizationId,
      title: payload.title,
      message: payload.message,
      type: payload.type ?? 'INFO',
      userId: payload.userId ?? null,
      link: payload.link ?? null,
    },
  });
};

export const markRead = (id: string) => {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

export const markAllRead = (organizationId: string, userId: string) => {
  return prisma.notification.updateMany({
    where: {
      organizationId,
      isRead: false,
      OR: [{ userId }, { userId: null }],
    },
    data: { isRead: true },
  });
};

export const remove = (id: string) => {
  return prisma.notification.delete({ where: { id } });
};
