import { z } from 'zod';
import { CatalogStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

export const createWarehouseSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    code: z.string().trim().max(50).optional(),
    address: z.string().trim().max(255).optional(),
    city: z.string().trim().max(100).optional(),
    country: z.string().trim().max(100).optional(),
    isDefault: z.boolean().optional(),
    status: z.nativeEnum(CatalogStatus).optional(),
  }),
});

export const updateWarehouseSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    code: z.string().trim().max(50).optional().nullable(),
    address: z.string().trim().max(255).optional().nullable(),
    city: z.string().trim().max(100).optional().nullable(),
    country: z.string().trim().max(100).optional().nullable(),
    isDefault: z.boolean().optional(),
    status: z.nativeEnum(CatalogStatus).optional(),
  }),
});

export const warehouseIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const listWarehousesSchema = z.object({
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
  }),
});

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>['body'];
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>['body'];
export type ListWarehousesQuery = z.infer<typeof listWarehousesSchema>['query'];
