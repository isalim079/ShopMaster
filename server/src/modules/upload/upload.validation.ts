import { z } from 'zod';

import { PAGINATION } from '../../core/constants/pagination';

export const listUploadsSchema = z.object({
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
  }),
});

export const uploadIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export type ListUploadsQuery = z.infer<typeof listUploadsSchema>['query'];
