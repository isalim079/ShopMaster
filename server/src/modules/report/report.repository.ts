import { DocumentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../core/database';

export const findSales = (organizationId: string, filters: { from?: Date; to?: Date; customerId?: string }, skip: number, take: number) => {
  const where: Prisma.SaleWhereInput = { organizationId, status: DocumentStatus.COMPLETED };
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.from || filters.to) {
    where.saleDate = {};
    if (filters.from) where.saleDate.gte = filters.from;
    if (filters.to) where.saleDate.lte = filters.to;
  }
  return prisma.$transaction([
    prisma.sale.findMany({ where, skip, take, orderBy: { saleDate: 'desc' }, include: { customer: { select: { id: true, name: true } } } }),
    prisma.sale.count({ where }),
  ]);
};

export const findPurchases = (organizationId: string, filters: { from?: Date; to?: Date; supplierId?: string }, skip: number, take: number) => {
  const where: Prisma.PurchaseWhereInput = { organizationId, status: { notIn: [DocumentStatus.DRAFT, DocumentStatus.CANCELLED] } };
  if (filters.supplierId) where.supplierId = filters.supplierId;
  if (filters.from || filters.to) {
    where.orderDate = {};
    if (filters.from) where.orderDate.gte = filters.from;
    if (filters.to) where.orderDate.lte = filters.to;
  }
  return prisma.$transaction([
    prisma.purchase.findMany({ where, skip, take, orderBy: { orderDate: 'desc' }, include: { supplier: { select: { id: true, name: true } } } }),
    prisma.purchase.count({ where }),
  ]);
};

export const findInventory = (organizationId: string, filters: { warehouseId?: string; search?: string }, skip: number, take: number) => {
  const where: Prisma.InventoryStockWhereInput = { organizationId };
  if (filters.warehouseId) where.warehouseId = filters.warehouseId;
  if (filters.search) {
    where.product = { name: { contains: filters.search, mode: 'insensitive' } };
  }
  return prisma.$transaction([
    prisma.inventoryStock.findMany({
      where, skip, take, orderBy: { updatedAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true, purchasePrice: true, salePrice: true } },
        warehouse: { select: { id: true, name: true } },
      },
    }),
    prisma.inventoryStock.count({ where }),
  ]);
};

export const findExpenses = (organizationId: string, filters: { from?: Date; to?: Date; categoryId?: string }, skip: number, take: number) => {
  const where: Prisma.ExpenseWhereInput = { organizationId };
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.from || filters.to) {
    where.expenseDate = {};
    if (filters.from) where.expenseDate.gte = filters.from;
    if (filters.to) where.expenseDate.lte = filters.to;
  }
  return prisma.$transaction([
    prisma.expense.findMany({ where, skip, take, orderBy: { expenseDate: 'desc' }, include: { category: { select: { id: true, name: true } } } }),
    prisma.expense.count({ where }),
  ]);
};

export const aggregateProfitLoss = async (organizationId: string, from?: Date, to?: Date) => {
  const saleWhere: Prisma.SaleWhereInput = { organizationId, status: DocumentStatus.COMPLETED };
  const purchaseWhere: Prisma.PurchaseWhereInput = { organizationId, status: { notIn: [DocumentStatus.DRAFT, DocumentStatus.CANCELLED] } };
  const expenseWhere: Prisma.ExpenseWhereInput = { organizationId };
  if (from || to) {
    saleWhere.saleDate = {};
    purchaseWhere.orderDate = {};
    expenseWhere.expenseDate = {};
    if (from) { saleWhere.saleDate.gte = from; purchaseWhere.orderDate.gte = from; expenseWhere.expenseDate.gte = from; }
    if (to) { saleWhere.saleDate.lte = to; purchaseWhere.orderDate.lte = to; expenseWhere.expenseDate.lte = to; }
  }
  const [sales, purchases, expenses] = await Promise.all([
    prisma.sale.aggregate({ where: saleWhere, _sum: { total: true } }),
    prisma.purchase.aggregate({ where: purchaseWhere, _sum: { total: true } }),
    prisma.expense.aggregate({ where: expenseWhere, _sum: { amount: true } }),
  ]);
  return { sales, purchases, expenses };
};
