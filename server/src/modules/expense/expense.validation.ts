import { z } from 'zod';
import { CatalogStatus, PaymentMethod } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

export const createExpenseCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(1000).optional(),
    status: z.nativeEnum(CatalogStatus).optional(),
  }),
});

export const updateExpenseCategorySchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    status: z.nativeEnum(CatalogStatus).optional(),
  }),
});

export const listExpenseCategoriesSchema = z.object({
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
    status: z.nativeEnum(CatalogStatus).optional(),
  }),
});

export const expenseCategoryIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const createExpenseSchema = z.object({
  body: z.object({
    categoryId: z.string().trim().min(1).max(64).optional(),
    title: z.string().trim().min(1).max(200),
    amount: z.coerce.number().positive(),
    expenseDate: z.coerce.date().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    reference: z.string().trim().max(200).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    categoryId: z.string().trim().min(1).max(64).optional().nullable(),
    title: z.string().trim().min(1).max(200).optional(),
    amount: z.coerce.number().positive().optional(),
    expenseDate: z.coerce.date().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    reference: z.string().trim().max(200).optional().nullable(),
    notes: z.string().trim().max(1000).optional().nullable(),
  }),
});

export const listExpensesSchema = z.object({
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
    categoryId: z.string().trim().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});

export const expenseIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export type CreateExpenseCategoryInput = z.infer<
  typeof createExpenseCategorySchema
>['body'];
export type UpdateExpenseCategoryInput = z.infer<
  typeof updateExpenseCategorySchema
>['body'];
export type ListExpenseCategoriesQuery = z.infer<
  typeof listExpenseCategoriesSchema
>['query'];
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>['body'];
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>['body'];
export type ListExpensesQuery = z.infer<typeof listExpensesSchema>['query'];
