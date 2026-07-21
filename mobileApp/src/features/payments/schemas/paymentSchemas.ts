import { z } from 'zod';

import { PAYMENT_DIRECTIONS, PAYMENT_METHODS } from '@/src/shared/types/enums';
import { zNumPositive } from '@/src/shared/schemas/numbers';

export const paymentFormSchema = z
  .object({
    direction: z.enum(PAYMENT_DIRECTIONS),
    method: z.enum(PAYMENT_METHODS).optional(),
    amount: zNumPositive('Amount must be > 0'),
    paymentDate: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
    saleId: z.string().optional(),
    purchaseId: z.string().optional(),
    customerId: z.string().optional(),
    supplierId: z.string().optional(),
  })
  .refine(
    (data) =>
      Boolean(
        data.saleId?.trim() ||
          data.purchaseId?.trim() ||
          data.customerId?.trim() ||
          data.supplierId?.trim(),
      ),
    {
      message: 'Link a sale, purchase, customer, or supplier',
      path: ['saleId'],
    },
  );

export type PaymentFormValues = z.output<typeof paymentFormSchema>;
export type PaymentFormInput = z.input<typeof paymentFormSchema>;
