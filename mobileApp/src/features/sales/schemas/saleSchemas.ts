import { z } from 'zod';

import { zNumMin, zNumOptional, zNumPositive } from '@/src/shared/schemas/numbers';

const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product required'),
  quantity: zNumPositive('Quantity must be > 0'),
  unitPrice: zNumMin(0),
  taxRate: zNumOptional,
  discount: zNumOptional,
});

export const saleFormSchema = z
  .object({
    warehouseId: z.string().min(1, 'Warehouse required'),
    customerId: z.string().optional(),
    saleDate: z.string().optional(),
    status: z.enum(['DRAFT', 'COMPLETED']).optional(),
    /** Client-side: how discountValue is interpreted before API submit */
    discountType: z.enum(['PERCENTAGE', 'AMOUNT']).default('AMOUNT'),
    discountValue: zNumOptional,
    notes: z.string().optional(),
    items: z.array(saleItemSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const raw = data.discountValue;
    if (raw == null || (typeof raw === 'string' && raw.trim() === '')) return;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountValue'],
        message: 'Discount must be 0 or greater',
      });
      return;
    }
    if (data.discountType === 'PERCENTAGE' && n > 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountValue'],
        message: 'Percentage cannot exceed 100',
      });
    }
  });

export type SaleFormValues = z.output<typeof saleFormSchema>;
export type SaleFormInput = z.input<typeof saleFormSchema>;
export type SaleDiscountType = 'PERCENTAGE' | 'AMOUNT';
