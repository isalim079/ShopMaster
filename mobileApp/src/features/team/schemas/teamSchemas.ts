import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Need one uppercase letter')
  .regex(/[a-z]/, 'Need one lowercase letter')
  .regex(/[0-9]/, 'Need one number')
  .regex(/[^A-Za-z0-9]/, 'Need one special character');

export const createTeamMemberSchema = z.object({
  firstName: z.string().trim().min(2, 'First name required'),
  lastName: z.string().trim().optional(),
  email: z.string().trim().email('Valid email required'),
  phone: z.string().trim().optional(),
  password: passwordSchema,
  roleSlug: z.enum(['MANAGER', 'EMPLOYEE']),
});

export type CreateTeamMemberFormValues = z.infer<typeof createTeamMemberSchema>;
