import { z } from 'zod';

import { PAGINATION } from '../../core/constants/pagination';

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(50)
  .regex(
    /^[A-Z][A-Z0-9_]*$/,
    'Slug must be uppercase letters, numbers, and underscores.',
  );

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    slug: slugSchema,
    description: z.string().trim().max(255).optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(255).optional().nullable(),
  }),
});

export const roleIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const listRolesSchema = z.object({
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
    isSystem: z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => {
        if (value === undefined) {
          return undefined;
        }

        return value === 'true';
      }),
  }),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>['body'];
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>['body'];
export type ListRolesQuery = z.infer<typeof listRolesSchema>['query'];
