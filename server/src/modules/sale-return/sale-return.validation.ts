import { z } from 'zod';
import { DocumentStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

const saleReturnItemInput = z.object({
  saleItemId: z.string().trim().min(1).max(64),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0).optional(),
});

export const createSaleReturnSchema = z.object({
  body: z.object({
    saleId: z.string().trim().min(1).max(64),
    returnDate: z.coerce.date().optional(),
    notes: z.string().trim().max(1000).optional(),
    items: z.array(saleReturnItemInput).min(1),
  }),
});

export const listSaleReturnsSchema = z.object({
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
    saleId: z.string().trim().optional(),
    customerId: z.string().trim().optional(),
  }),
});

export const saleReturnIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export type CreateSaleReturnInput = z.infer<
  typeof createSaleReturnSchema
>['body'];
export type ListSaleReturnsQuery = z.infer<
  typeof listSaleReturnsSchema
>['query'];
export type SaleReturnItemInput = z.infer<typeof saleReturnItemInput>;
