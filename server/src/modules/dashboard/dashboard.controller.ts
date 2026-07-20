import { Request, Response } from 'express';

import * as dashboardService from './dashboard.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type {
  SeriesQuery,
  TopCustomersQuery,
  TopProductsQuery,
} from './dashboard.validation';

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getSummary(req.user!.organizationId);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Dashboard summary fetched.', data });
});

export const getToday = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getToday(req.user!.organizationId);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Today stats fetched.', data });
});

export const getWeekly = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getWeekly(req.user!.organizationId);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Weekly stats fetched.', data });
});

export const getMonthly = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getMonthly(req.user!.organizationId);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Monthly stats fetched.', data });
});

export const getCharts = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as SeriesQuery;
  const data = await dashboardService.getCharts(req.user!.organizationId, query.days);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Charts fetched.', data });
});

export const getTopProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as TopProductsQuery;
  const data = await dashboardService.getTopProducts(req.user!.organizationId, query.days, query.limit);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Top products fetched.', data });
});

export const getTopCustomers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as TopCustomersQuery;
  const data = await dashboardService.getTopCustomers(req.user!.organizationId, query.days, query.limit);
  return apiResponse({ res, statusCode: HTTP_STATUS.OK, message: 'Top customers fetched.', data });
});
