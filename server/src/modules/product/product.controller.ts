import { Request, Response } from 'express';

import * as productService from './product.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListProductsQuery } from './product.validation';

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.createProduct(
      req.user!.organizationId,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Product created successfully.',
      data: result,
    });
  },
);

export const getProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getProducts(
      req.user!.organizationId,
      req.query as unknown as ListProductsQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Products fetched successfully.',
      data: result.products,
      meta: result.meta,
    });
  },
);

export const searchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getProducts(
      req.user!.organizationId,
      req.query as unknown as ListProductsQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Products fetched successfully.',
      data: result.products,
      meta: result.meta,
    });
  },
);

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await productService.getProductById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Product fetched successfully.',
      data: result,
    });
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await productService.updateProduct(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Product updated successfully.',
      data: result,
    });
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await productService.deleteProduct(
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

export const adjustProductStock = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await productService.adjustProductStock(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Stock adjusted successfully.',
      data: result,
    });
  },
);
