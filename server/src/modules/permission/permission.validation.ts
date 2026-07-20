import { z } from 'zod';

import { PAGINATION } from '../../core/constants/pagination';

const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(100)
  .regex(
    /^[a-z][a-z0-9]*:[a-z][a-z0-9_]*$/,
    'Slug must look like module:action (e.g. users:read).',
  );

export const createPermissionSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    slug: slugSchema,
    module: z.string().trim().min(2).max(50).toLowerCase(),
    description: z.string().trim().max(255).optional(),
  }),
});

export const updatePermissionSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(255).optional().nullable(),
    module: z.string().trim().min(2).max(50).toLowerCase().optional(),
  }),
});

export const permissionIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const listPermissionsSchema = z.object({
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
    module: z.string().trim().toLowerCase().optional(),
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

export const roleIdParamSchema = z.object({
  params: z.object({
    roleId: z.string().trim().min(1).max(64),
  }),
});

export const syncRolePermissionsSchema = z.object({
  params: z.object({
    roleId: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    permissionIds: z.array(z.string().trim().min(1).max(64)).min(0),
  }),
});

export type CreatePermissionInput = z.infer<
  typeof createPermissionSchema
>['body'];

export type UpdatePermissionInput = z.infer<
  typeof updatePermissionSchema
>['body'];

export type ListPermissionsQuery = z.infer<
  typeof listPermissionsSchema
>['query'];

export type SyncRolePermissionsInput = z.infer<
  typeof syncRolePermissionsSchema
>['body'];
