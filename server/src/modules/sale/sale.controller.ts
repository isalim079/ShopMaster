import { Request, Response } from 'express';

import * as saleService from './sale.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListSalesQuery } from './sale.validation';

export const createSale = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await saleService.createSale(
      req.user!.organizationId,
      req.body,
      req.user!.id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Sale created successfully.',
      data: result,
    });
  },
);

export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const result = await saleService.getSales(
    req.user!.organizationId,
    req.query as unknown as ListSalesQuery,
  );

  return apiResponse({
    res,
    statusCode: HTTP_STATUS.OK,
    message: 'Sales fetched successfully.',
    data: result.sales,
    meta: result.meta,
  });
});

export const getSaleById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await saleService.getSaleById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Sale fetched successfully.',
      data: result,
    });
  },
);

export const updateSale = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await saleService.updateSale(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Sale updated successfully.',
      data: result,
    });
  },
);

export const cancelSale = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await saleService.cancelSale(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);

export const completeSale = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await saleService.completeSale(
      req.user!.organizationId,
      id,
      req.user!.id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Sale completed successfully.',
      data: result,
    });
  },
);

export const getSaleInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await saleService.getSaleInvoice(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Sale invoice fetched successfully.',
      data: result,
    });
  },
);
