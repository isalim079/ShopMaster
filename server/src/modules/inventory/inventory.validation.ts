import { z } from 'zod';
import { StockMovementType } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

export const listStocksSchema = z.object({
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
    warehouseId: z.string().trim().optional(),
    productId: z.string().trim().optional(),
    search: z.string().trim().optional(),
    lowStock: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
  }),
});

export const listMovementsSchema = z.object({
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
    productId: z.string().trim().optional(),
    warehouseId: z.string().trim().optional(),
    type: z.nativeEnum(StockMovementType).optional(),
  }),
});

export const adjustmentSchema = z.object({
  body: z.object({
    productId: z.string().trim().min(1).max(64),
    warehouseId: z.string().trim().min(1).max(64),
    quantity: z.coerce.number(),
    note: z.string().trim().max(500).optional(),
  }),
});

export type ListStocksQuery = z.infer<typeof listStocksSchema>['query'];
export type ListMovementsQuery = z.infer<typeof listMovementsSchema>['query'];
export type AdjustmentInput = z.infer<typeof adjustmentSchema>['body'];
