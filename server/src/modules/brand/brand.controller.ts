import { Request, Response } from 'express';

import * as brandService from './brand.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListBrandsQuery } from './brand.validation';

export const createBrand = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await brandService.createBrand(
      req.user!.organizationId,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Brand created successfully.',
      data: result,
    });
  },
);

export const getBrands = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await brandService.getBrands(
      req.user!.organizationId,
      req.query as unknown as ListBrandsQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Brands fetched successfully.',
      data: result.brands,
      meta: result.meta,
    });
  },
);

export const getBrandById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await brandService.getBrandById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Brand fetched successfully.',
      data: result,
    });
  },
);

export const updateBrand = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await brandService.updateBrand(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Brand updated successfully.',
      data: result,
    });
  },
);

export const deleteBrand = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await brandService.deleteBrand(
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
