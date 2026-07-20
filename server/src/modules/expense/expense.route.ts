import { Router } from 'express';

import * as expenseController from './expense.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createExpenseCategorySchema,
  createExpenseSchema,
  expenseCategoryIdSchema,
  expenseIdSchema,
  listExpenseCategoriesSchema,
  listExpensesSchema,
  updateExpenseCategorySchema,
  updateExpenseSchema,
} from './expense.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const categoryRouter = Router();

categoryRouter.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.EXPENSES_WRITE),
  validate(createExpenseCategorySchema),
  expenseController.createExpenseCategory,
);

categoryRouter.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.EXPENSES_READ),
  validate(listExpenseCategoriesSchema),
  expenseController.getExpenseCategories,
);

categoryRouter.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.EXPENSES_READ),
  validate(expenseCategoryIdSchema),
  expenseController.getExpenseCategoryById,
);

categoryRouter.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.EXPENSES_WRITE),
  validate(updateExpenseCategorySchema),
  expenseController.updateExpenseCategory,
);

categoryRouter.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.EXPENSES_DELETE),
  validate(expenseCategoryIdSchema),
  expenseController.deleteExpenseCategory,
);

const expenseRouter = Router();

expenseRouter.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.EXPENSES_WRITE),
  validate(createExpenseSchema),
  expenseController.createExpense,
);

expenseRouter.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.EXPENSES_READ),
  validate(listExpensesSchema),
  expenseController.getExpenses,
);

expenseRouter.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.EXPENSES_READ),
  validate(expenseIdSchema),
  expenseController.getExpenseById,
);

expenseRouter.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.EXPENSES_WRITE),
  validate(updateExpenseSchema),
  expenseController.updateExpense,
);

expenseRouter.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.EXPENSES_DELETE),
  validate(expenseIdSchema),
  expenseController.deleteExpense,
);

export { categoryRouter, expenseRouter };
