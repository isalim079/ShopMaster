import { z } from 'zod';
import { DocumentStatus, PaymentStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

const saleItemInput = z.object({
  productId: z.string().trim().min(1).max(64),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
});

export const createSaleSchema = z.object({
  body: z.object({
    warehouseId: z.string().trim().min(1).max(64),
    customerId: z.string().trim().min(1).max(64).optional(),
    saleDate: z.coerce.date().optional(),
    status: z
      .enum([DocumentStatus.DRAFT, DocumentStatus.COMPLETED])
      .optional(),
    discountAmount: z.coerce.number().min(0).optional(),
    notes: z.string().trim().max(1000).optional(),
    items: z.array(saleItemInput).min(1),
  }),
});

export const listSalesSchema = z.object({
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
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    customerId: z.string().trim().optional(),
    warehouseId: z.string().trim().optional(),
  }),
});

export const saleIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const updateSaleSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    customerId: z.string().trim().min(1).max(64).optional().nullable(),
    warehouseId: z.string().trim().min(1).max(64).optional(),
    saleDate: z.coerce.date().optional(),
    discountAmount: z.coerce.number().min(0).optional(),
    notes: z.string().trim().max(1000).optional().nullable(),
    items: z.array(saleItemInput).min(1).optional(),
  }),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>['body'];
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>['body'];
export type ListSalesQuery = z.infer<typeof listSalesSchema>['query'];
export type SaleItemInput = z.infer<typeof saleItemInput>;
