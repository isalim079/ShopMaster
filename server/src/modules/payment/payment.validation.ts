import { z } from 'zod';
import { PaymentDirection, PaymentMethod } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

export const createPaymentSchema = z.object({
  body: z
    .object({
      direction: z.nativeEnum(PaymentDirection),
      method: z.nativeEnum(PaymentMethod).optional(),
      amount: z.coerce.number().positive(),
      paymentDate: z.coerce.date().optional(),
      reference: z.string().trim().max(200).optional(),
      notes: z.string().trim().max(1000).optional(),
      customerId: z.string().trim().min(1).max(64).optional(),
      supplierId: z.string().trim().min(1).max(64).optional(),
      saleId: z.string().trim().min(1).max(64).optional(),
      purchaseId: z.string().trim().min(1).max(64).optional(),
    })
    .refine(
      (data) =>
        data.customerId ||
        data.supplierId ||
        data.saleId ||
        data.purchaseId,
      {
        message:
          'At least one of customerId, supplierId, saleId, or purchaseId must be provided.',
      },
    ),
});

export const listPaymentsSchema = z.object({
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
    direction: z.nativeEnum(PaymentDirection).optional(),
    method: z.nativeEnum(PaymentMethod).optional(),
    customerId: z.string().trim().optional(),
    supplierId: z.string().trim().optional(),
    saleId: z.string().trim().optional(),
    purchaseId: z.string().trim().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});

export const paymentIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type ListPaymentsQuery = z.infer<typeof listPaymentsSchema>['query'];
