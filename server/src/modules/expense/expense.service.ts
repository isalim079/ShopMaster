import { CatalogStatus, Prisma } from '@prisma/client';

import * as repository from './expense.repository';
import {
  toExpenseCategoryListResponse,
  toExpenseCategoryResponse,
  toExpenseListResponse,
  toExpenseResponse,
} from './expense.mapper';
import type {
  CreateExpenseCategoryInput,
  CreateExpenseInput,
  ListExpenseCategoriesQuery,
  ListExpensesQuery,
  UpdateExpenseCategoryInput,
  UpdateExpenseInput,
} from './expense.validation';
import type {
  ExpenseCategoryResponse,
  ExpenseResponse,
  ListExpenseCategoriesResult,
  ListExpensesResult,
} from './expense.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';

export const createExpenseCategory = async (
  organizationId: string,
  payload: CreateExpenseCategoryInput,
): Promise<ExpenseCategoryResponse> => {
  const existing = await repository.findCategoryByName(
    organizationId,
    payload.name,
  );
  if (existing) {
    throw new AppError(
      'Expense category with this name already exists.',
      HTTP_STATUS.CONFLICT,
    );
  }

  const data: Prisma.ExpenseCategoryUncheckedCreateInput = {
    organizationId,
    name: payload.name,
    description: payload.description ?? null,
  };
  if (payload.status) data.status = payload.status;

  const created = await repository.createCategory(data);
  return toExpenseCategoryResponse(created);
};

export const getExpenseCategories = async (
  organizationId: string,
  query: ListExpenseCategoriesQuery,
): Promise<ListExpenseCategoriesResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListExpenseCategoriesQuery['status']>;
  } = {};
  if (query.search) filters.search = query.search;
  if (query.status) filters.status = query.status;

  const [categories, total] = await repository.findCategories(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    categories: toExpenseCategoryListResponse(categories),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getExpenseCategoryById = async (
  organizationId: string,
  id: string,
): Promise<ExpenseCategoryResponse> => {
  const category = await repository.findCategoryById(organizationId, id);
  if (!category) {
    throw new AppError('Expense category not found.', HTTP_STATUS.NOT_FOUND);
  }
  return toExpenseCategoryResponse(category);
};

export const updateExpenseCategory = async (
  organizationId: string,
  id: string,
  payload: UpdateExpenseCategoryInput,
): Promise<ExpenseCategoryResponse> => {
  const category = await repository.findCategoryById(organizationId, id);
  if (!category) {
    throw new AppError('Expense category not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (payload.name && payload.name !== category.name) {
    const existing = await repository.findCategoryByName(
      organizationId,
      payload.name,
    );
    if (existing && existing.id !== id) {
      throw new AppError(
        'Expense category with this name already exists.',
        HTTP_STATUS.CONFLICT,
      );
    }
  }

  const data: Prisma.ExpenseCategoryUpdateInput = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.status !== undefined) data.status = payload.status;

  const updated = await repository.updateCategory(id, data);
  return toExpenseCategoryResponse(updated);
};

export const deleteExpenseCategory = async (
  organizationId: string,
  id: string,
): Promise<{ message: string }> => {
  const category = await repository.findCategoryById(organizationId, id);
  if (!category) {
    throw new AppError('Expense category not found.', HTTP_STATUS.NOT_FOUND);
  }

  await repository.updateCategory(id, { status: CatalogStatus.INACTIVE });
  return { message: 'Expense category deactivated successfully.' };
};

export const createExpense = async (
  organizationId: string,
  payload: CreateExpenseInput,
  createdById?: string,
): Promise<ExpenseResponse> => {
  if (payload.categoryId) {
    const category = await repository.findCategoryById(
      organizationId,
      payload.categoryId,
    );
    if (!category) {
      throw new AppError(
        'Expense category not found in this organization.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  const data: Prisma.ExpenseUncheckedCreateInput = {
    organizationId,
    title: payload.title,
    amount: payload.amount,
    reference: payload.reference ?? null,
    notes: payload.notes ?? null,
  };
  if (payload.categoryId) data.categoryId = payload.categoryId;
  if (payload.expenseDate) data.expenseDate = payload.expenseDate;
  if (payload.paymentMethod) data.paymentMethod = payload.paymentMethod;
  if (createdById) data.createdById = createdById;

  const created = await repository.createExpense(data);
  return toExpenseResponse(created);
};

export const getExpenses = async (
  organizationId: string,
  query: ListExpensesQuery,
): Promise<ListExpensesResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    categoryId?: string;
    paymentMethod?: NonNullable<ListExpensesQuery['paymentMethod']>;
    from?: Date;
    to?: Date;
  } = {};
  if (query.search) filters.search = query.search;
  if (query.categoryId) filters.categoryId = query.categoryId;
  if (query.paymentMethod) filters.paymentMethod = query.paymentMethod;
  if (query.from) filters.from = query.from;
  if (query.to) filters.to = query.to;

  const [expenses, total] = await repository.findExpenses(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    expenses: toExpenseListResponse(expenses),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getExpenseById = async (
  organizationId: string,
  id: string,
): Promise<ExpenseResponse> => {
  const expense = await repository.findExpenseById(organizationId, id);
  if (!expense) {
    throw new AppError('Expense not found.', HTTP_STATUS.NOT_FOUND);
  }
  return toExpenseResponse(expense);
};

export const updateExpense = async (
  organizationId: string,
  id: string,
  payload: UpdateExpenseInput,
): Promise<ExpenseResponse> => {
  const expense = await repository.findExpenseById(organizationId, id);
  if (!expense) {
    throw new AppError('Expense not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (payload.categoryId) {
    const category = await repository.findCategoryById(
      organizationId,
      payload.categoryId,
    );
    if (!category) {
      throw new AppError(
        'Expense category not found in this organization.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  const data: Prisma.ExpenseUpdateInput = {};
  if (payload.categoryId === null) {
    data.category = { disconnect: true };
  } else if (payload.categoryId) {
    data.category = { connect: { id: payload.categoryId } };
  }
  if (payload.title !== undefined) data.title = payload.title;
  if (payload.amount !== undefined) data.amount = payload.amount;
  if (payload.expenseDate !== undefined) data.expenseDate = payload.expenseDate;
  if (payload.paymentMethod !== undefined)
    data.paymentMethod = payload.paymentMethod;
  if (payload.reference !== undefined) data.reference = payload.reference;
  if (payload.notes !== undefined) data.notes = payload.notes;

  const updated = await repository.updateExpense(id, data);
  return toExpenseResponse(updated);
};

export const deleteExpense = async (
  organizationId: string,
  id: string,
): Promise<{ message: string }> => {
  const expense = await repository.findExpenseById(organizationId, id);
  if (!expense) {
    throw new AppError('Expense not found.', HTTP_STATUS.NOT_FOUND);
  }
  await repository.deleteExpense(id);
  return { message: 'Expense deleted successfully.' };
};
