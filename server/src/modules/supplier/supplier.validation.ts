import { z } from 'zod';
import { PartyStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.email().trim().toLowerCase().optional(),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().max(255).optional(),
    city: z.string().trim().max(100).optional(),
    country: z.string().trim().max(100).optional(),
    taxId: z.string().trim().max(50).optional(),
    notes: z.string().trim().max(1000).optional(),
    status: z.nativeEnum(PartyStatus).optional(),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.email().trim().toLowerCase().optional().nullable(),
    phone: z.string().trim().max(30).optional().nullable(),
    address: z.string().trim().max(255).optional().nullable(),
    city: z.string().trim().max(100).optional().nullable(),
    country: z.string().trim().max(100).optional().nullable(),
    taxId: z.string().trim().max(50).optional().nullable(),
    notes: z.string().trim().max(1000).optional().nullable(),
    status: z.nativeEnum(PartyStatus).optional(),
  }),
});

export const supplierIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const listSuppliersSchema = z.object({
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
    status: z.nativeEnum(PartyStatus).optional(),
  }),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>['body'];
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>['body'];
export type ListSuppliersQuery = z.infer<typeof listSuppliersSchema>['query'];
