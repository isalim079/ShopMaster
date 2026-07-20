import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type {
  ListExpenseCategoriesFilters,
  ListExpensesFilters,
} from './expense.types';

const expenseInclude = {
  category: { select: { id: true, name: true } },
};

export const findCategoryById = (organizationId: string, id: string) =>
  prisma.expenseCategory.findFirst({ where: { id, organizationId } });

export const findCategoryByName = (organizationId: string, name: string) =>
  prisma.expenseCategory.findFirst({ where: { organizationId, name } });

export const findCategories = (
  organizationId: string,
  filters: ListExpenseCategoriesFilters,
  skip: number,
  take: number,
) => {
  const where = buildCategoryWhere(organizationId, filters);
  return prisma.$transaction([
    prisma.expenseCategory.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.expenseCategory.count({ where }),
  ]);
};

export const createCategory = (data: Prisma.ExpenseCategoryUncheckedCreateInput) =>
  prisma.expenseCategory.create({ data });

export const updateCategory = (
  id: string,
  data: Prisma.ExpenseCategoryUpdateInput,
) => prisma.expenseCategory.update({ where: { id }, data });

export const deleteCategory = (id: string) =>
  prisma.expenseCategory.delete({ where: { id } });

const buildCategoryWhere = (
  organizationId: string,
  filters: ListExpenseCategoriesFilters,
): Prisma.ExpenseCategoryWhereInput => {
  const where: Prisma.ExpenseCategoryWhereInput = { organizationId };
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }
  return where;
};

export const findExpenseById = (organizationId: string, id: string) =>
  prisma.expense.findFirst({
    where: { id, organizationId },
    include: expenseInclude,
  });

export const findExpenses = (
  organizationId: string,
  filters: ListExpensesFilters,
  skip: number,
  take: number,
) => {
  const where = buildExpenseWhere(organizationId, filters);
  return prisma.$transaction([
    prisma.expense.findMany({
      where,
      skip,
      take,
      include: expenseInclude,
      orderBy: { expenseDate: 'desc' },
    }),
    prisma.expense.count({ where }),
  ]);
};

export const createExpense = (data: Prisma.ExpenseUncheckedCreateInput) =>
  prisma.expense.create({
    data,
    include: expenseInclude,
  });

export const updateExpense = (
  id: string,
  data: Prisma.ExpenseUpdateInput,
) =>
  prisma.expense.update({
    where: { id },
    data,
    include: expenseInclude,
  });

export const deleteExpense = (id: string) =>
  prisma.expense.delete({ where: { id } });

const buildExpenseWhere = (
  organizationId: string,
  filters: ListExpensesFilters,
): Prisma.ExpenseWhereInput => {
  const where: Prisma.ExpenseWhereInput = { organizationId };
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
  if (filters.from || filters.to) {
    where.expenseDate = {};
    if (filters.from) where.expenseDate.gte = filters.from;
    if (filters.to) where.expenseDate.lte = filters.to;
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { reference: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  return where;
};
