import { z } from 'zod';

import { zNumMin, zNumOptional, zNumPositive } from '@/src/shared/schemas/numbers';

const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product required'),
  quantity: zNumPositive('Quantity must be > 0'),
  unitCost: zNumMin(0),
  taxRate: zNumOptional,
  discount: zNumOptional,
});

export const purchaseFormSchema = z.object({
  supplierId: z.string().min(1, 'Supplier required'),
  warehouseId: z.string().min(1, 'Warehouse required'),
  orderDate: z.string().optional(),
  status: z.enum(['DRAFT', 'ORDERED']).optional(),
  discountAmount: zNumOptional,
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1),
});

export type PurchaseFormValues = z.output<typeof purchaseFormSchema>;
export type PurchaseFormInput = z.input<typeof purchaseFormSchema>;

export const receivePurchaseSchema = z.object({
  items: z
    .array(
      z.object({
        purchaseItemId: z.string().min(1),
        quantity: zNumPositive(),
        productName: z.string().optional(),
        remaining: z.number().optional(),
      }),
    )
    .min(1),
});

export type ReceivePurchaseFormValues = z.output<typeof receivePurchaseSchema>;
export type ReceivePurchaseFormInput = z.input<typeof receivePurchaseSchema>;
