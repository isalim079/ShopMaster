import { z } from 'zod';

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: 'Enter a valid email',
  });

export const customerFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: optionalEmail,
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  address: z.string().trim().max(255).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  taxId: z.string().trim().max(50).optional().or(z.literal('')),
  creditLimit: z.string().trim().optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
