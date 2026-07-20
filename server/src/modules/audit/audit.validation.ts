import { z } from 'zod';

import { PAGINATION } from '../../core/constants/pagination';

export const listAuditLogsSchema = z.object({
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
    action: z.string().trim().optional(),
    entity: z.string().trim().optional(),
    userId: z.string().trim().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsSchema>['query'];
