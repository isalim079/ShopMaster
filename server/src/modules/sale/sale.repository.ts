import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListSalesFilters } from './sale.types';

const saleInclude = {
  customer: { select: { id: true, name: true } },
  warehouse: { select: { id: true, name: true } },
};

const saleDetailInclude = {
  customer: { select: { id: true, name: true } },
  warehouse: { select: { id: true, name: true } },
  items: {
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

export const findById = (organizationId: string, id: string) => {
  return prisma.sale.findFirst({
    where: { id, organizationId },
    include: saleDetailInclude,
  });
};

export const findByIdBasic = (organizationId: string, id: string) => {
  return prisma.sale.findFirst({
    where: { id, organizationId },
    include: { items: true },
  });
};

export const findInvoiceById = (organizationId: string, id: string) => {
  return prisma.sale.findFirst({
    where: { id, organizationId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      warehouse: { select: { id: true, name: true } },
      organization: { select: { name: true } },
      items: {
        include: { product: { select: { name: true } } },
        orderBy: { createdAt: 'asc' as const },
      },
    },
  });
};

export const findMany = (
  organizationId: string,
  filters: ListSalesFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.sale.findMany({
      where,
      skip,
      take,
      include: saleInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.sale.count({ where }),
  ]);
};

const buildWhere = (
  organizationId: string,
  filters: ListSalesFilters,
): Prisma.SaleWhereInput => {
  const where: Prisma.SaleWhereInput = { organizationId };

  if (filters.status) where.status = filters.status;
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.warehouseId) where.warehouseId = filters.warehouseId;
  if (filters.search) {
    where.number = { contains: filters.search, mode: 'insensitive' };
  }

  return where;
};
