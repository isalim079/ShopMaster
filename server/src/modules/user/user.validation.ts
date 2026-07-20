import { z } from 'zod';
import { UserStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(100)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character.',
  );

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().max(50).optional(),
    phone: z.string().trim().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
  }),
});

export const listUsersSchema = z.object({
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
    roleId: z.string().trim().min(1).max(64).optional(),
    roleSlug: z.string().trim().optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    status: z.nativeEnum(UserStatus),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    roleId: z.string().trim().min(1).max(64),
  }),
});

export type UpdateProfileInput = z.infer<
  typeof updateProfileSchema
>['body'];

export type ChangePasswordInput = z.infer<
  typeof changePasswordSchema
>['body'];

export type ListUsersQuery = z.infer<
  typeof listUsersSchema
>['query'];
