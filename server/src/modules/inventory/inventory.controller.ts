import { Request, Response } from 'express';

import * as inventoryService from './inventory.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListStocksQuery, ListMovementsQuery } from './inventory.validation';

export const getStocks = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await inventoryService.getStocks(
      req.user!.organizationId,
      req.query as unknown as ListStocksQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Inventory stocks fetched successfully.',
      data: result.stocks,
      meta: result.meta,
    });
  },
);

export const getMovements = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await inventoryService.getMovements(
      req.user!.organizationId,
      req.query as unknown as ListMovementsQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Inventory movements fetched successfully.',
      data: result.movements,
      meta: result.meta,
    });
  },
);

export const createAdjustment = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await inventoryService.createAdjustment(
      req.user!.organizationId,
      req.body,
      req.user!.id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Stock adjustment created successfully.',
      data: result,
    });
  },
);
