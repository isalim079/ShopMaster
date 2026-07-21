import { z } from 'zod';

import { zNumOptional, zNumPositive } from '@/src/shared/schemas/numbers';

export const saleReturnFormSchema = z.object({
  saleId: z.string().min(1, 'Sale required'),
  returnDate: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        saleItemId: z.string().min(1),
        quantity: zNumPositive(),
        unitPrice: zNumOptional,
      }),
    )
    .min(1),
});

export type SaleReturnFormValues = z.output<typeof saleReturnFormSchema>;
export type SaleReturnFormInput = z.input<typeof saleReturnFormSchema>;
