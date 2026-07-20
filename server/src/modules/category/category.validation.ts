import { z } from 'zod';
import { CatalogStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional(),
    parentId: z.string().trim().min(1).max(64).optional(),
    status: z.nativeEnum(CatalogStatus).optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional().nullable(),
    parentId: z.string().trim().min(1).max(64).optional().nullable(),
    status: z.nativeEnum(CatalogStatus).optional(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const listCategoriesSchema = z.object({
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

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
export type ListCategoriesQuery = z.infer<typeof listCategoriesSchema>['query'];
