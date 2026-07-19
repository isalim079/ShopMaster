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

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(50),

    lastName: z.string().trim().max(50).optional(),

    email: z.email().trim().toLowerCase(),

    phone: z.string().trim().optional(),

    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(1),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.email().trim().toLowerCase(),
    otp: z.string().length(6),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.email().trim().toLowerCase(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email().trim().toLowerCase(),
  }),
});

export const verifyResetOtpSchema = z.object({
  body: z.object({
    email: z.email().trim().toLowerCase(),
    otp: z.string().length(6),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.email().trim().toLowerCase(),
    otp: z.string().length(6),
    password: passwordSchema,
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});