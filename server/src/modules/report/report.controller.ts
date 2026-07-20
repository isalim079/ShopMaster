import { Request, Response } from 'express';
import * as reportService from './report.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type {
  ExpensesReportQuery, InventoryReportQuery, ProfitLossQuery, PurchasesReportQuery, SalesReportQuery,
} from './report.validation';

export const sales = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.salesReport(req.user!.organizationId, req.query as unknown as SalesReportQuery);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Sales report fetched.', data: result.rows, meta: result.meta });
});
export const purchases = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.purchasesReport(req.user!.organizationId, req.query as unknown as PurchasesReportQuery);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Purchases report fetched.', data: result.rows, meta: result.meta });
});
export const inventory = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.inventoryReport(req.user!.organizationId, req.query as unknown as InventoryReportQuery);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Inventory report fetched.', data: result.rows, meta: result.meta });
});
export const expenses = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.expensesReport(req.user!.organizationId, req.query as unknown as ExpensesReportQuery);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Expenses report fetched.', data: result.rows, meta: result.meta });
});
export const profitLoss = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportService.profitLoss(req.user!.organizationId, req.query as unknown as ProfitLossQuery);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Profit & loss fetched.', data });
});
