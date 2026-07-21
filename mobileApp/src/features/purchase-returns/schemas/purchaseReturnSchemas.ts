import { z } from 'zod';

import { zNumOptional, zNumPositive } from '@/src/shared/schemas/numbers';

export const purchaseReturnFormSchema = z.object({
  purchaseId: z.string().min(1, 'Purchase required'),
  returnDate: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        purchaseItemId: z.string().min(1),
        quantity: zNumPositive(),
        unitCost: zNumOptional,
      }),
    )
    .min(1),
});

export type PurchaseReturnFormValues = z.output<typeof purchaseReturnFormSchema>;
export type PurchaseReturnFormInput = z.input<typeof purchaseReturnFormSchema>;
