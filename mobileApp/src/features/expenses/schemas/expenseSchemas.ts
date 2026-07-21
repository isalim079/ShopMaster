import { z } from 'zod';

import { CATALOG_STATUSES, PAYMENT_METHODS } from '@/src/shared/types/enums';
import { zNumPositive } from '@/src/shared/schemas/numbers';

export const expenseFormSchema = z.object({
  title: z.string().trim().min(1, 'Title required'),
  amount: zNumPositive('Amount must be > 0'),
  categoryId: z.string().optional(),
  expenseDate: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type ExpenseFormValues = z.output<typeof expenseFormSchema>;
export type ExpenseFormInput = z.input<typeof expenseFormSchema>;

export const expenseCategoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name required'),
  description: z.string().optional(),
  status: z.enum(CATALOG_STATUSES).optional(),
});

export type ExpenseCategoryFormValues = z.infer<typeof expenseCategoryFormSchema>;
