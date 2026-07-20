import { Request, Response } from 'express';

import * as purchaseService from './purchase.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListPurchasesQuery } from './purchase.validation';

export const createPurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await purchaseService.createPurchase(
      req.user!.organizationId,
      req.body,
      req.user!.id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Purchase created successfully.',
      data: result,
    });
  },
);

export const getPurchases = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await purchaseService.getPurchases(
      req.user!.organizationId,
      req.query as unknown as ListPurchasesQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Purchases fetched successfully.',
      data: result.purchases,
      meta: result.meta,
    });
  },
);

export const getPurchaseById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await purchaseService.getPurchaseById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Purchase fetched successfully.',
      data: result,
    });
  },
);

export const updatePurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await purchaseService.updatePurchase(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Purchase updated successfully.',
      data: result,
    });
  },
);

export const cancelPurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await purchaseService.cancelPurchase(
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

export const receivePurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await purchaseService.receivePurchase(
      req.user!.organizationId,
      id,
      req.body,
      req.user!.id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Purchase received successfully.',
      data: result,
    });
  },
);
