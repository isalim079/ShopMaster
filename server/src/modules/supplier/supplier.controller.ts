import { Request, Response } from 'express';

import * as supplierService from './supplier.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListSuppliersQuery } from './supplier.validation';

export const createSupplier = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await supplierService.createSupplier(
      req.user!.organizationId,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Supplier created successfully.',
      data: result,
    });
  },
);

export const getSuppliers = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await supplierService.getSuppliers(
      req.user!.organizationId,
      req.query as unknown as ListSuppliersQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Suppliers fetched successfully.',
      data: result.suppliers,
      meta: result.meta,
    });
  },
);

export const getSupplierById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await supplierService.getSupplierById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Supplier fetched successfully.',
      data: result,
    });
  },
);

export const updateSupplier = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await supplierService.updateSupplier(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Supplier updated successfully.',
      data: result,
    });
  },
);

export const deleteSupplier = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await supplierService.deleteSupplier(
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
