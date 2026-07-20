import { z } from 'zod';
import { DocumentStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

const purchaseItemInput = z.object({
  productId: z.string().trim().min(1).max(64),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
});

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.string().trim().min(1).max(64),
    warehouseId: z.string().trim().min(1).max(64),
    orderDate: z.coerce.date().optional(),
    expectedDate: z.coerce.date().optional(),
    status: z
      .enum([DocumentStatus.DRAFT, DocumentStatus.ORDERED])
      .optional(),
    discountAmount: z.coerce.number().min(0).optional(),
    notes: z.string().trim().max(1000).optional(),
    items: z.array(purchaseItemInput).min(1),
  }),
});

export const listPurchasesSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .optional()
      .default(PAGINATION.DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(PAGINATION.MAX_LIMIT)
      .optional()
      .default(PAGINATION.DEFAULT_LIMIT),
    search: z.string().trim().optional(),
    status: z.nativeEnum(DocumentStatus).optional(),
    supplierId: z.string().trim().optional(),
    warehouseId: z.string().trim().optional(),
  }),
});

export const purchaseIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const updatePurchaseSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    supplierId: z.string().trim().min(1).max(64).optional(),
    warehouseId: z.string().trim().min(1).max(64).optional(),
    orderDate: z.coerce.date().optional(),
    expectedDate: z.coerce.date().optional().nullable(),
    status: z
      .enum([DocumentStatus.DRAFT, DocumentStatus.ORDERED])
      .optional(),
    discountAmount: z.coerce.number().min(0).optional(),
    notes: z.string().trim().max(1000).optional().nullable(),
    items: z.array(purchaseItemInput).min(1).optional(),
  }),
});

export const receivePurchaseSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    items: z
      .array(
        z.object({
          purchaseItemId: z.string().trim().min(1).max(64),
          quantity: z.coerce.number().positive(),
        }),
      )
      .min(1),
  }),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>['body'];
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>['body'];
export type ListPurchasesQuery = z.infer<typeof listPurchasesSchema>['query'];
export type ReceivePurchaseInput = z.infer<
  typeof receivePurchaseSchema
>['body'];
export type PurchaseItemInput = z.infer<typeof purchaseItemInput>;
