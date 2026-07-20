import { z } from 'zod';
import { DocumentStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

const purchaseReturnItemInput = z.object({
  purchaseItemId: z.string().trim().min(1).max(64),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().min(0).optional(),
});

export const createPurchaseReturnSchema = z.object({
  body: z.object({
    purchaseId: z.string().trim().min(1).max(64),
    returnDate: z.coerce.date().optional(),
    notes: z.string().trim().max(1000).optional(),
    items: z.array(purchaseReturnItemInput).min(1),
  }),
});

export const listPurchaseReturnsSchema = z.object({
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
    purchaseId: z.string().trim().optional(),
    supplierId: z.string().trim().optional(),
  }),
});

export const purchaseReturnIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export type CreatePurchaseReturnInput = z.infer<
  typeof createPurchaseReturnSchema
>['body'];
export type ListPurchaseReturnsQuery = z.infer<
  typeof listPurchaseReturnsSchema
>['query'];
export type PurchaseReturnItemInput = z.infer<typeof purchaseReturnItemInput>;
