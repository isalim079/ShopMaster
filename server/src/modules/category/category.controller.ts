import { Request, Response } from 'express';

import * as categoryService from './category.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListCategoriesQuery } from './category.validation';

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await categoryService.createCategory(
      req.user!.organizationId,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Category created successfully.',
      data: result,
    });
  },
);

export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await categoryService.getCategories(
      req.user!.organizationId,
      req.query as unknown as ListCategoriesQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Categories fetched successfully.',
      data: result.categories,
      meta: result.meta,
    });
  },
);

export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await categoryService.getCategoryById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Category fetched successfully.',
      data: result,
    });
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await categoryService.updateCategory(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Category updated successfully.',
      data: result,
    });
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await categoryService.deleteCategory(
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
