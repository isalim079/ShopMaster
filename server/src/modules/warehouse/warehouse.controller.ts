import { Request, Response } from 'express';

import * as warehouseService from './warehouse.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListWarehousesQuery } from './warehouse.validation';

export const createWarehouse = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await warehouseService.createWarehouse(
      req.user!.organizationId,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Warehouse created successfully.',
      data: result,
    });
  },
);

export const getWarehouses = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await warehouseService.getWarehouses(
      req.user!.organizationId,
      req.query as unknown as ListWarehousesQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Warehouses fetched successfully.',
      data: result.warehouses,
      meta: result.meta,
    });
  },
);

export const getWarehouseById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await warehouseService.getWarehouseById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Warehouse fetched successfully.',
      data: result,
    });
  },
);

export const updateWarehouse = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await warehouseService.updateWarehouse(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Warehouse updated successfully.',
      data: result,
    });
  },
);

export const deleteWarehouse = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await warehouseService.deleteWarehouse(
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
