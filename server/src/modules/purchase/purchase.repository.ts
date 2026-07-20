import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListPurchasesFilters } from './purchase.types';

const purchaseInclude = {
  supplier: { select: { id: true, name: true } },
  warehouse: { select: { id: true, name: true } },
};

const purchaseDetailInclude = {
  supplier: { select: { id: true, name: true } },
  warehouse: { select: { id: true, name: true } },
  items: {
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

export const findById = (organizationId: string, id: string) => {
  return prisma.purchase.findFirst({
    where: { id, organizationId },
    include: purchaseDetailInclude,
  });
};

export const findByIdBasic = (organizationId: string, id: string) => {
  return prisma.purchase.findFirst({
    where: { id, organizationId },
    include: { items: true },
  });
};

export const findMany = (
  organizationId: string,
  filters: ListPurchasesFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.purchase.findMany({
      where,
      skip,
      take,
      include: purchaseInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.purchase.count({ where }),
  ]);
};

const buildWhere = (
  organizationId: string,
  filters: ListPurchasesFilters,
): Prisma.PurchaseWhereInput => {
  const where: Prisma.PurchaseWhereInput = { organizationId };

  if (filters.status) where.status = filters.status;
  if (filters.supplierId) where.supplierId = filters.supplierId;
  if (filters.warehouseId) where.warehouseId = filters.warehouseId;
  if (filters.search) {
    where.number = { contains: filters.search, mode: 'insensitive' };
  }

  return where;
};
