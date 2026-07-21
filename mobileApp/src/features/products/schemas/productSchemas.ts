import { z } from 'zod';

import { CATALOG_STATUSES } from '@/src/shared/types/enums';
import { zNumMin, zNumOptional } from '@/src/shared/schemas/numbers';

export const productFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  unit: z.string().optional(),
  purchasePrice: zNumMin(0, 'Purchase price required'),
  salePrice: zNumMin(0, 'Sale price required'),
  taxRate: zNumOptional,
  reorderLevel: zNumOptional,
  warehouseId: z.string().optional(),
  openingStock: zNumOptional,
  status: z.enum(CATALOG_STATUSES).optional(),
});

export type ProductFormValues = z.output<typeof productFormSchema>;
export type ProductFormInput = z.input<typeof productFormSchema>;
