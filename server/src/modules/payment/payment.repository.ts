import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListPaymentsFilters } from './payment.types';

const paymentInclude = {
  customer: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  sale: { select: { id: true, number: true } },
  purchase: { select: { id: true, number: true } },
};

export const findById = (organizationId: string, id: string) => {
  return prisma.payment.findFirst({
    where: { id, organizationId },
    include: paymentInclude,
  });
};

export const findMany = (
  organizationId: string,
  filters: ListPaymentsFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.payment.findMany({
      where,
      skip,
      take,
      include: paymentInclude,
      orderBy: { paymentDate: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);
};

const buildWhere = (
  organizationId: string,
  filters: ListPaymentsFilters,
): Prisma.PaymentWhereInput => {
  const where: Prisma.PaymentWhereInput = { organizationId };

  if (filters.direction) where.direction = filters.direction;
  if (filters.method) where.method = filters.method;
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.supplierId) where.supplierId = filters.supplierId;
  if (filters.saleId) where.saleId = filters.saleId;
  if (filters.purchaseId) where.purchaseId = filters.purchaseId;

  if (filters.from || filters.to) {
    where.paymentDate = {};
    if (filters.from) where.paymentDate.gte = filters.from;
    if (filters.to) where.paymentDate.lte = filters.to;
  }

  if (filters.search) {
    where.reference = { contains: filters.search, mode: 'insensitive' };
  }

  return where;
};
