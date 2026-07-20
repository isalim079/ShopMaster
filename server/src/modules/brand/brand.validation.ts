import { z } from 'zod';
import { CatalogStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional(),
    logoUrl: z.string().trim().url().max(500).optional(),
    status: z.nativeEnum(CatalogStatus).optional(),
  }),
});

export const updateBrandSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional().nullable(),
    logoUrl: z.string().trim().url().max(500).optional().nullable(),
    status: z.nativeEnum(CatalogStatus).optional(),
  }),
});

export const brandIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const listBrandsSchema = z.object({
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

export type CreateBrandInput = z.infer<typeof createBrandSchema>['body'];
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>['body'];
export type ListBrandsQuery = z.infer<typeof listBrandsSchema>['query'];
