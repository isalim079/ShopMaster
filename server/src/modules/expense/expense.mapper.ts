import type { Expense, ExpenseCategory } from '@prisma/client';

import { decimalToNumber } from '../product/product.mapper';
import type {
  ExpenseCategoryResponse,
  ExpenseResponse,
} from './expense.types';

type ExpenseWithRelations = Expense & {
  category?: { name: string } | null;
};

export const toExpenseCategoryResponse = (
  category: ExpenseCategory,
): ExpenseCategoryResponse => ({
  id: category.id,
  organizationId: category.organizationId,
  name: category.name,
  description: category.description,
  status: category.status,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

export const toExpenseCategoryListResponse = (
  categories: ExpenseCategory[],
): ExpenseCategoryResponse[] => categories.map(toExpenseCategoryResponse);

export const toExpenseResponse = (
  expense: ExpenseWithRelations,
): ExpenseResponse => {
  const response: ExpenseResponse = {
    id: expense.id,
    organizationId: expense.organizationId,
    categoryId: expense.categoryId,
    title: expense.title,
    amount: decimalToNumber(expense.amount),
    expenseDate: expense.expenseDate,
    paymentMethod: expense.paymentMethod,
    reference: expense.reference,
    notes: expense.notes,
    createdById: expense.createdById,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };

  if (expense.category?.name) response.categoryName = expense.category.name;
  return response;
};

export const toExpenseListResponse = (
  expenses: ExpenseWithRelations[],
): ExpenseResponse[] => expenses.map(toExpenseResponse);
