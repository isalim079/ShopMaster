import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[a-z]/, 'Must include a lowercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name is required'),
    lastName: z.string().trim().optional(),
    email: z.string().email('Enter a valid email'),
    /** National number digits only (no country code). */
    phoneNational: z.string().trim().optional(),
    /** ISO 3166-1 alpha-2, e.g. BD */
    phoneCountry: z.string().length(2).optional(),
    /** E.164 value built client-side when phone provided. */
    phone: z.string().trim().optional(),
    password: passwordSchema,
    organizationName: z.string().trim().min(2, 'Organization name is required'),
  })
  .superRefine((values, ctx) => {
    const national = values.phoneNational?.replace(/\D/g, '') ?? '';
    if (!national) return;
    if (!values.phone) {
      ctx.addIssue({
        code: 'custom',
        path: ['phoneNational'],
        message: 'Enter a valid phone number for the selected country',
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const verifyResetOtpSchema = z.object({
  email: z.string().email('Enter a valid email'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export type VerifyResetOtpFormValues = z.infer<typeof verifyResetOtpSchema>;

export const resetPasswordSchema = z
  .object({
    resetToken: z.string().min(1, 'Reset session expired. Request a new code.'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
