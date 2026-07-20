import { z } from 'zod';

import { PAGINATION } from '../../core/constants/pagination';

export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
    message: z.string().trim().min(1).max(2000),
    type: z.string().trim().min(1).max(50).optional().default('INFO'),
    userId: z.string().trim().min(1).max(64).optional().nullable(),
    link: z.string().trim().max(500).optional().nullable(),
  }),
});

export const listNotificationsSchema = z.object({
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
    isRead: z.enum(['true', 'false']).optional(),
  }),
});

export const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export type CreateNotificationInput = z.infer<
  typeof createNotificationSchema
>['body'];
export type ListNotificationsQuery = z.infer<
  typeof listNotificationsSchema
>['query'];
