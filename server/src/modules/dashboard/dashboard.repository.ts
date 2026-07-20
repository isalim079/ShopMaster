import { DocumentStatus, PaymentDirection, PaymentStatus, Prisma } from '@prisma/client';

import { prisma } from '../../core/database';

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
};

export const sumSales = (
  organizationId: string,
  from: Date,
  to: Date,
) => {
  return prisma.sale.aggregate({
    where: {
      organizationId,
      status: DocumentStatus.COMPLETED,
      saleDate: { gte: from, lte: to },
    },
    _sum: { total: true },
    _count: { _all: true },
  });
};

export const sumPurchases = (
  organizationId: string,
  from: Date,
  to: Date,
) => {
  return prisma.purchase.aggregate({
    where: {
      organizationId,
      status: { in: [DocumentStatus.RECEIVED, DocumentStatus.PARTIAL, DocumentStatus.COMPLETED, DocumentStatus.ORDERED] },
      orderDate: { gte: from, lte: to },
    },
    _sum: { total: true },
    _count: { _all: true },
  });
};

export const sumExpenses = (
  organizationId: string,
  from: Date,
  to: Date,
) => {
  return prisma.expense.aggregate({
    where: {
      organizationId,
      expenseDate: { gte: from, lte: to },
    },
    _sum: { amount: true },
    _count: { _all: true },
  });
};

export const sumPayments = (
  organizationId: string,
  direction: PaymentDirection,
  from: Date,
  to: Date,
) => {
  return prisma.payment.aggregate({
    where: {
      organizationId,
      direction,
      paymentDate: { gte: from, lte: to },
    },
    _sum: { amount: true },
  });
};

export const unpaidSalesTotal = (organizationId: string) => {
  return prisma.sale.findMany({
    where: {
      organizationId,
      status: DocumentStatus.COMPLETED,
      paymentStatus: { not: PaymentStatus.PAID },
    },
    select: { total: true, paidAmount: true },
  });
};

export const unpaidPurchasesTotal = (organizationId: string) => {
  return prisma.purchase.findMany({
    where: {
      organizationId,
      status: { notIn: [DocumentStatus.DRAFT, DocumentStatus.CANCELLED] },
      paymentStatus: { not: PaymentStatus.PAID },
    },
    select: { total: true, paidAmount: true },
  });
};

export const stockRows = (organizationId: string) => {
  return prisma.inventoryStock.findMany({
    where: { organizationId },
    include: {
      product: {
        select: {
          purchasePrice: true,
          reorderLevel: true,
          name: true,
        },
      },
    },
  });
};

export const dailySales = (organizationId: string, from: Date) => {
  return prisma.$queryRaw<Array<{ day: Date; total: Prisma.Decimal }>>`
    SELECT date_trunc('day', "saleDate") as day, COALESCE(SUM(total), 0) as total
    FROM "Sale"
    WHERE "organizationId" = ${organizationId}
      AND status = 'COMPLETED'
      AND "saleDate" >= ${from}
    GROUP BY 1
    ORDER BY 1
  `;
};

export const dailyPurchases = (organizationId: string, from: Date) => {
  return prisma.$queryRaw<Array<{ day: Date; total: Prisma.Decimal }>>`
    SELECT date_trunc('day', "orderDate") as day, COALESCE(SUM(total), 0) as total
    FROM "Purchase"
    WHERE "organizationId" = ${organizationId}
      AND status NOT IN ('DRAFT', 'CANCELLED')
      AND "orderDate" >= ${from}
    GROUP BY 1
    ORDER BY 1
  `;
};

export const topProducts = (organizationId: string, from: Date, limit: number) => {
  return prisma.$queryRaw<
    Array<{ productId: string; productName: string; quantity: Prisma.Decimal; total: Prisma.Decimal }>
  >`
    SELECT si."productId" as "productId",
           p.name as "productName",
           COALESCE(SUM(si.quantity), 0) as quantity,
           COALESCE(SUM(si."lineTotal"), 0) as total
    FROM "SaleItem" si
    JOIN "Sale" s ON s.id = si."saleId"
    JOIN "Product" p ON p.id = si."productId"
    WHERE s."organizationId" = ${organizationId}
      AND s.status = 'COMPLETED'
      AND s."saleDate" >= ${from}
    GROUP BY si."productId", p.name
    ORDER BY quantity DESC
    LIMIT ${limit}
  `;
};

export const topCustomers = (organizationId: string, from: Date, limit: number) => {
  return prisma.$queryRaw<
    Array<{ customerId: string; customerName: string; amount: Prisma.Decimal; count: bigint }>
  >`
    SELECT s."customerId" as "customerId",
           c.name as "customerName",
           COALESCE(SUM(s.total), 0) as amount,
           COUNT(*)::bigint as count
    FROM "Sale" s
    JOIN "Customer" c ON c.id = s."customerId"
    WHERE s."organizationId" = ${organizationId}
      AND s.status = 'COMPLETED'
      AND s."customerId" IS NOT NULL
      AND s."saleDate" >= ${from}
    GROUP BY s."customerId", c.name
    ORDER BY amount DESC
    LIMIT ${limit}
  `;
};

export { startOfDay, endOfDay, daysAgo };
