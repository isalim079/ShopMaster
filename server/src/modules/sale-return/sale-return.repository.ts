import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListSaleReturnsFilters } from './sale-return.types';

const listInclude = {
  customer: { select: { id: true, name: true } },
  warehouse: { select: { id: true, name: true } },
  sale: { select: { id: true, number: true } },
};

const detailInclude = {
  customer: { select: { id: true, name: true } },
  warehouse: { select: { id: true, name: true } },
  sale: { select: { id: true, number: true } },
  items: {
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

export const findById = (organizationId: string, id: string) => {
  return prisma.saleReturn.findFirst({
    where: { id, organizationId },
    include: detailInclude,
  });
};

export const findByIdBasic = (organizationId: string, id: string) => {
  return prisma.saleReturn.findFirst({
    where: { id, organizationId },
  });
};

export const findMany = (
  organizationId: string,
  filters: ListSaleReturnsFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.saleReturn.findMany({
      where,
      skip,
      take,
      include: listInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.saleReturn.count({ where }),
  ]);
};

const buildWhere = (
  organizationId: string,
  filters: ListSaleReturnsFilters,
): Prisma.SaleReturnWhereInput => {
  const where: Prisma.SaleReturnWhereInput = { organizationId };
  if (filters.status) where.status = filters.status;
  if (filters.saleId) where.saleId = filters.saleId;
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.search) {
    where.number = { contains: filters.search, mode: 'insensitive' };
  }
  return where;
};
