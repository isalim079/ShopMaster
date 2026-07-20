import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListPurchaseReturnsFilters } from './purchase-return.types';

const listInclude = {
  supplier: { select: { id: true, name: true } },
  warehouse: { select: { id: true, name: true } },
  purchase: { select: { id: true, number: true } },
};

const detailInclude = {
  supplier: { select: { id: true, name: true } },
  warehouse: { select: { id: true, name: true } },
  purchase: { select: { id: true, number: true } },
  items: {
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

export const findById = (organizationId: string, id: string) => {
  return prisma.purchaseReturn.findFirst({
    where: { id, organizationId },
    include: detailInclude,
  });
};

export const findByIdBasic = (organizationId: string, id: string) => {
  return prisma.purchaseReturn.findFirst({
    where: { id, organizationId },
  });
};

export const findMany = (
  organizationId: string,
  filters: ListPurchaseReturnsFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.purchaseReturn.findMany({
      where,
      skip,
      take,
      include: listInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.purchaseReturn.count({ where }),
  ]);
};

const buildWhere = (
  organizationId: string,
  filters: ListPurchaseReturnsFilters,
): Prisma.PurchaseReturnWhereInput => {
  const where: Prisma.PurchaseReturnWhereInput = { organizationId };
  if (filters.status) where.status = filters.status;
  if (filters.purchaseId) where.purchaseId = filters.purchaseId;
  if (filters.supplierId) where.supplierId = filters.supplierId;
  if (filters.search) {
    where.number = { contains: filters.search, mode: 'insensitive' };
  }
  return where;
};
