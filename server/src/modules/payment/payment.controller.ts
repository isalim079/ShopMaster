import { Request, Response } from 'express';

import * as paymentService from './payment.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListPaymentsQuery } from './payment.validation';

export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await paymentService.createPayment(
      req.user!.organizationId,
      req.body,
      req.user!.id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Payment created successfully.',
      data: result,
    });
  },
);

export const getPayments = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await paymentService.getPayments(
      req.user!.organizationId,
      req.query as unknown as ListPaymentsQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Payments fetched successfully.',
      data: result.payments,
      meta: result.meta,
    });
  },
);

export const getPaymentById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await paymentService.getPaymentById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Payment fetched successfully.',
      data: result,
    });
  },
);

export const deletePayment = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await paymentService.deletePayment(
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
