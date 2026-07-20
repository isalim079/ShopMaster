import { Request, Response } from 'express';

import * as saleReturnService from './sale-return.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListSaleReturnsQuery } from './sale-return.validation';

export const createSaleReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await saleReturnService.createSaleReturn(
      req.user!.organizationId,
      req.body,
      req.user!.id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Sale return created successfully.',
      data: result,
    });
  },
);

export const getSaleReturns = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await saleReturnService.getSaleReturns(
      req.user!.organizationId,
      req.query as unknown as ListSaleReturnsQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Sale returns fetched successfully.',
      data: result.saleReturns,
      meta: result.meta,
    });
  },
);

export const getSaleReturnById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await saleReturnService.getSaleReturnById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Sale return fetched successfully.',
      data: result,
    });
  },
);
