import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';

export const findMany = (
  organizationId: string,
  filters: {
    action?: string;
    entity?: string;
    userId?: string;
    from?: Date;
    to?: Date;
  },
  skip: number,
  take: number,
) => {
  const where: Prisma.AuditLogWhereInput = { organizationId };

  if (filters.action) where.action = filters.action;
  if (filters.entity) where.entity = filters.entity;
  if (filters.userId) where.userId = filters.userId;
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = filters.from;
    if (filters.to) where.createdAt.lte = filters.to;
  }

  return prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);
};
