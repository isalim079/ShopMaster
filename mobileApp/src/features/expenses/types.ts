import type { CatalogStatus, PaymentMethod } from '@/src/shared/types/enums';

export type ExpenseCategory = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  id: string;
  organizationId: string;
  categoryId: string | null;
  categoryName?: string;
  title: string;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
  notes: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseCategoryInput = {
  name: string;
  description?: string;
  status?: CatalogStatus;
};

export type ExpenseInput = {
  categoryId?: string;
  title: string;
  amount: number;
  expenseDate?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
};

export type ExpenseUpdateInput = {
  categoryId?: string | null;
  title?: string;
  amount?: number;
  expenseDate?: string;
  paymentMethod?: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
};
