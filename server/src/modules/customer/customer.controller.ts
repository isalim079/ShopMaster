import { Request, Response } from 'express';

import * as customerService from './customer.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListCustomersQuery } from './customer.validation';

export const createCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await customerService.createCustomer(
      req.user!.organizationId,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Customer created successfully.',
      data: result,
    });
  },
);

export const getCustomers = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await customerService.getCustomers(
      req.user!.organizationId,
      req.query as unknown as ListCustomersQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Customers fetched successfully.',
      data: result.customers,
      meta: result.meta,
    });
  },
);

export const getCustomerById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await customerService.getCustomerById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Customer fetched successfully.',
      data: result,
    });
  },
);

export const updateCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await customerService.updateCustomer(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Customer updated successfully.',
      data: result,
    });
  },
);

export const deleteCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await customerService.deleteCustomer(
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
