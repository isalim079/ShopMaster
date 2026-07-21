import { z } from 'zod';

export const warehouseFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  address: z.string().trim().max(255).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  isDefault: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;
