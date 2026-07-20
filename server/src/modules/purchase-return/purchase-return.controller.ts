import { Request, Response } from 'express';

import * as purchaseReturnService from './purchase-return.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListPurchaseReturnsQuery } from './purchase-return.validation';

export const createPurchaseReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await purchaseReturnService.createPurchaseReturn(
      req.user!.organizationId,
      req.body,
      req.user!.id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Purchase return created successfully.',
      data: result,
    });
  },
);

export const getPurchaseReturns = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await purchaseReturnService.getPurchaseReturns(
      req.user!.organizationId,
      req.query as unknown as ListPurchaseReturnsQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Purchase returns fetched successfully.',
      data: result.purchaseReturns,
      meta: result.meta,
    });
  },
);

export const getPurchaseReturnById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await purchaseReturnService.getPurchaseReturnById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Purchase return fetched successfully.',
      data: result,
    });
  },
);
