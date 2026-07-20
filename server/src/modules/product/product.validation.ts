import { z } from 'zod';
import { CatalogStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(200),
    sku: z.string().trim().max(100).optional(),
    barcode: z.string().trim().max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    categoryId: z.string().trim().max(64).optional(),
    brandId: z.string().trim().max(64).optional(),
    unit: z.string().trim().max(20).optional(),
    purchasePrice: z.coerce.number().min(0),
    salePrice: z.coerce.number().min(0),
    taxRate: z.coerce.number().min(0).max(100).optional(),
    reorderLevel: z.coerce.number().min(0).optional(),
    imageUrl: z.string().trim().url().optional(),
    status: z.nativeEnum(CatalogStatus).optional(),
    warehouseId: z.string().trim().max(64).optional(),
    openingStock: z.coerce.number().min(0).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(200).optional(),
    sku: z.string().trim().max(100).optional().nullable(),
    barcode: z.string().trim().max(100).optional().nullable(),
    description: z.string().trim().max(1000).optional().nullable(),
    categoryId: z.string().trim().max(64).optional().nullable(),
    brandId: z.string().trim().max(64).optional().nullable(),
    unit: z.string().trim().max(20).optional(),
    purchasePrice: z.coerce.number().min(0).optional(),
    salePrice: z.coerce.number().min(0).optional(),
    taxRate: z.coerce.number().min(0).max(100).optional(),
    reorderLevel: z.coerce.number().min(0).optional().nullable(),
    imageUrl: z.string().trim().url().optional().nullable(),
    status: z.nativeEnum(CatalogStatus).optional(),
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .optional()
      .default(PAGINATION.DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(PAGINATION.MAX_LIMIT)
      .optional()
      .default(PAGINATION.DEFAULT_LIMIT),
    search: z.string().trim().optional(),
    status: z.nativeEnum(CatalogStatus).optional(),
    categoryId: z.string().trim().optional(),
    brandId: z.string().trim().optional(),
  }),
});

export const adjustProductStockSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    warehouseId: z.string().trim().min(1).max(64),
    quantity: z.coerce.number(),
    note: z.string().trim().max(500).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ListProductsQuery = z.infer<typeof listProductsSchema>['query'];
export type AdjustProductStockInput = z.infer<typeof adjustProductStockSchema>['body'];
