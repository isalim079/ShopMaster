import { z } from 'zod';

import { zNumMin, zNumOptional, zNumPositive } from '@/src/shared/schemas/numbers';

const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product required'),
  quantity: zNumPositive('Quantity must be > 0'),
  unitPrice: zNumMin(0),
  taxRate: zNumOptional,
  discount: zNumOptional,
});

export const saleFormSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse required'),
  customerId: z.string().optional(),
  saleDate: z.string().optional(),
  status: z.enum(['DRAFT', 'COMPLETED']).optional(),
  discountAmount: zNumOptional,
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1),
});

export type SaleFormValues = z.output<typeof saleFormSchema>;
export type SaleFormInput = z.input<typeof saleFormSchema>;
