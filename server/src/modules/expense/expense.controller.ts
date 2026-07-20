import { Request, Response } from 'express';

import * as expenseService from './expense.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type {
  ListExpenseCategoriesQuery,
  ListExpensesQuery,
} from './expense.validation';

export const createExpenseCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await expenseService.createExpenseCategory(
      req.user!.organizationId,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Expense category created successfully.',
      data: result,
    });
  },
);

export const getExpenseCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await expenseService.getExpenseCategories(
      req.user!.organizationId,
      req.query as unknown as ListExpenseCategoriesQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Expense categories fetched successfully.',
      data: result.categories,
      meta: result.meta,
    });
  },
);

export const getExpenseCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await expenseService.getExpenseCategoryById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Expense category fetched successfully.',
      data: result,
    });
  },
);

export const updateExpenseCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await expenseService.updateExpenseCategory(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Expense category updated successfully.',
      data: result,
    });
  },
);

export const deleteExpenseCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await expenseService.deleteExpenseCategory(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);

export const createExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await expenseService.createExpense(
      req.user!.organizationId,
      req.body,
      req.user!.id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Expense created successfully.',
      data: result,
    });
  },
);

export const getExpenses = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await expenseService.getExpenses(
      req.user!.organizationId,
      req.query as unknown as ListExpensesQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Expenses fetched successfully.',
      data: result.expenses,
      meta: result.meta,
    });
  },
);

export const getExpenseById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await expenseService.getExpenseById(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Expense fetched successfully.',
      data: result,
    });
  },
);

export const updateExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await expenseService.updateExpense(
      req.user!.organizationId,
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Expense updated successfully.',
      data: result,
    });
  },
);

export const deleteExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await expenseService.deleteExpense(
      req.user!.organizationId,
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);
