import { z } from 'zod';

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
    status: z.enum([
      'PENDING',
      'ACTIVE',
      'BLOCKED',
    ]),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    role: z.enum([
      'SUPER_ADMIN',
      'ADMIN',
      'MANAGER',
      'EMPLOYEE',
    ]),
  }),
});

export type UpdateProfileInput = z.infer<
  typeof updateProfileSchema
>['body'];

export type ChangePasswordInput = z.infer<
  typeof changePasswordSchema
>['body'];