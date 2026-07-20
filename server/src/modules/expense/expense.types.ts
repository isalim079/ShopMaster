import { CatalogStatus, PaymentMethod } from '@prisma/client';

export interface ExpenseCategoryResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: CatalogStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseResponse {
  id: string;
  organizationId: string;
  categoryId: string | null;
  categoryName?: string;
  title: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: PaymentMethod;
  reference: string | null;
  notes: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListExpenseCategoriesFilters {
  search?: string;
  status?: CatalogStatus;
}

export interface ListExpensesFilters {
  search?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  from?: Date;
  to?: Date;
}

export interface ListExpensesResult {
  expenses: ExpenseResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListExpenseCategoriesResult {
  categories: ExpenseCategoryResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
