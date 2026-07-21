import { z } from 'zod';

import { zNum } from '@/src/shared/schemas/numbers';

export const inventoryAdjustSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  quantity: zNum.pipe(
    z.number().refine((n) => n !== 0, 'Quantity cannot be zero'),
  ),
  note: z.string().optional(),
});

export type InventoryAdjustFormValues = z.output<typeof inventoryAdjustSchema>;
export type InventoryAdjustFormInput = z.input<typeof inventoryAdjustSchema>;
