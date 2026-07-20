import { z } from 'zod';
import { PAGINATION } from '../../core/constants/pagination';

const dateRange = {
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
};

export const salesReportSchema = z.object({
  query: z.object({ ...dateRange, customerId: z.string().trim().optional() }),
});
export const purchasesReportSchema = z.object({
  query: z.object({ ...dateRange, supplierId: z.string().trim().optional() }),
});
export const inventoryReportSchema = z.object({
  query: z.object({
    page: dateRange.page,
    limit: dateRange.limit,
    warehouseId: z.string().trim().optional(),
    search: z.string().trim().optional(),
  }),
});
export const expensesReportSchema = z.object({
  query: z.object({ ...dateRange, categoryId: z.string().trim().optional() }),
});
export const profitLossSchema = z.object({
  query: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});

export type SalesReportQuery = z.infer<typeof salesReportSchema>['query'];
export type PurchasesReportQuery = z.infer<typeof purchasesReportSchema>['query'];
export type InventoryReportQuery = z.infer<typeof inventoryReportSchema>['query'];
export type ExpensesReportQuery = z.infer<typeof expensesReportSchema>['query'];
export type ProfitLossQuery = z.infer<typeof profitLossSchema>['query'];
