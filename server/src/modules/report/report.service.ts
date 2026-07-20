import * as repository from './report.repository';
import { decimalToNumber } from '../product/product.mapper';
import type {
  ExpensesReportQuery,
  InventoryReportQuery,
  ProfitLossQuery,
  PurchasesReportQuery,
  SalesReportQuery,
} from './report.validation';
import type { ProfitLossResponse } from './report.types';

const meta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 0,
});

export const salesReport = async (
  organizationId: string,
  query: SalesReportQuery,
) => {
  const skip = (query.page - 1) * query.limit;
  const filters: { from?: Date; to?: Date; customerId?: string } = {};
  if (query.from !== undefined) filters.from = query.from;
  if (query.to !== undefined) filters.to = query.to;
  if (query.customerId !== undefined) filters.customerId = query.customerId;

  const [rows, total] = await repository.findSales(
    organizationId,
    filters,
    skip,
    query.limit,
  );

  return {
    rows: rows.map((s) => ({
      id: s.id,
      number: s.number,
      saleDate: s.saleDate,
      customerId: s.customerId,
      customerName: s.customer?.name ?? null,
      total: decimalToNumber(s.total),
      paidAmount: decimalToNumber(s.paidAmount),
      paymentStatus: s.paymentStatus,
      status: s.status,
    })),
    meta: meta(query.page, query.limit, total),
  };
};

export const purchasesReport = async (
  organizationId: string,
  query: PurchasesReportQuery,
) => {
  const skip = (query.page - 1) * query.limit;
  const filters: { from?: Date; to?: Date; supplierId?: string } = {};
  if (query.from !== undefined) filters.from = query.from;
  if (query.to !== undefined) filters.to = query.to;
  if (query.supplierId !== undefined) filters.supplierId = query.supplierId;

  const [rows, total] = await repository.findPurchases(
    organizationId,
    filters,
    skip,
    query.limit,
  );

  return {
    rows: rows.map((p) => ({
      id: p.id,
      number: p.number,
      orderDate: p.orderDate,
      supplierId: p.supplierId,
      supplierName: p.supplier?.name ?? null,
      total: decimalToNumber(p.total),
      paidAmount: decimalToNumber(p.paidAmount),
      paymentStatus: p.paymentStatus,
      status: p.status,
    })),
    meta: meta(query.page, query.limit, total),
  };
};

export const inventoryReport = async (
  organizationId: string,
  query: InventoryReportQuery,
) => {
  const skip = (query.page - 1) * query.limit;
  const filters: { warehouseId?: string; search?: string } = {};
  if (query.warehouseId !== undefined) filters.warehouseId = query.warehouseId;
  if (query.search !== undefined) filters.search = query.search;

  const [rows, total] = await repository.findInventory(
    organizationId,
    filters,
    skip,
    query.limit,
  );

  return {
    rows: rows.map((r) => {
      const qty = decimalToNumber(r.quantity);
      const cost = decimalToNumber(r.product.purchasePrice);
      return {
        productId: r.productId,
        productName: r.product.name,
        sku: r.product.sku,
        warehouseId: r.warehouseId,
        warehouseName: r.warehouse.name,
        quantity: qty,
        unitCost: cost,
        value: qty * cost,
      };
    }),
    meta: meta(query.page, query.limit, total),
  };
};

export const expensesReport = async (
  organizationId: string,
  query: ExpensesReportQuery,
) => {
  const skip = (query.page - 1) * query.limit;
  const filters: { from?: Date; to?: Date; categoryId?: string } = {};
  if (query.from !== undefined) filters.from = query.from;
  if (query.to !== undefined) filters.to = query.to;
  if (query.categoryId !== undefined) filters.categoryId = query.categoryId;

  const [rows, total] = await repository.findExpenses(
    organizationId,
    filters,
    skip,
    query.limit,
  );

  return {
    rows: rows.map((e) => ({
      id: e.id,
      title: e.title,
      amount: decimalToNumber(e.amount),
      expenseDate: e.expenseDate,
      categoryId: e.categoryId,
      categoryName: e.category?.name ?? null,
      paymentMethod: e.paymentMethod,
    })),
    meta: meta(query.page, query.limit, total),
  };
};

export const profitLoss = async (
  organizationId: string,
  query: ProfitLossQuery,
): Promise<ProfitLossResponse> => {
  const { sales, purchases, expenses } = await repository.aggregateProfitLoss(
    organizationId,
    query.from,
    query.to,
  );
  const revenue = Number(sales._sum.total ?? 0);
  const purchaseTotal = Number(purchases._sum.total ?? 0);
  const expenseTotal = Number(expenses._sum.amount ?? 0);
  const grossProfit = revenue - purchaseTotal;

  return {
    from: (query.from ?? new Date(0)).toISOString().slice(0, 10),
    to: (query.to ?? new Date()).toISOString().slice(0, 10),
    revenue,
    purchases: purchaseTotal,
    expenses: expenseTotal,
    grossProfit,
    netProfit: grossProfit - expenseTotal,
  };
};
