import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/src/shared/api/unwrap';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
} from '@/src/shared/api/types';

import type {
  Expense,
  ExpenseCategory,
  ExpenseCategoryInput,
  ExpenseInput,
  ExpenseUpdateInput,
} from '../types';

export const expensesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExpenses: build.query<PaginatedResult<Expense>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/expenses',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<Expense[]>) =>
        unwrapList(response),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...stable } = queryArgs;
        return `${endpointName}(${JSON.stringify(stable)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) <= 1) return newItems;
        const seen = new Set(currentCache.items.map((e) => e.id));
        const appended = newItems.items.filter((e) => !seen.has(e.id));
        return {
          items: [...currentCache.items, ...appended],
          meta: newItems.meta,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: (result) =>
        result
          ? [
              { type: 'Expense' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'Expense' as const,
                id,
              })),
            ]
          : [{ type: 'Expense' as const, id: 'LIST' }],
    }),

    getExpenseById: build.query<Expense, string>({
      query: (id) => `/expenses/${id}`,
      transformResponse: (response: ApiSuccess<Expense>) => unwrapData(response),
      providesTags: (_r, _e, id) => [{ type: 'Expense', id }],
    }),

    createExpense: build.mutation<Expense, ExpenseInput>({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Expense>) => unwrapData(response),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'Dashboard', id: 'SUMMARY' },
      ],
    }),

    updateExpense: build.mutation<
      Expense,
      { id: string; body: ExpenseUpdateInput }
    >({
      query: ({ id, body }) => ({
        url: `/expenses/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<Expense>) => unwrapData(response),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
      ],
    }),

    deleteExpense: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
      ],
    }),

    getExpenseCategories: build.query<
      PaginatedResult<ExpenseCategory>,
      ListQueryArgs
    >({
      query: ({ page = 1, limit = 50, ...rest }) => ({
        url: '/expense-categories',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<ExpenseCategory[]>) =>
        unwrapList(response),
      providesTags: (result) =>
        result
          ? [
              { type: 'Expense' as const, id: 'CATEGORIES' },
              ...result.items.map(({ id }) => ({
                type: 'Expense' as const,
                id: `CAT:${id}`,
              })),
            ]
          : [{ type: 'Expense' as const, id: 'CATEGORIES' }],
      keepUnusedDataFor: 300,
    }),

    createExpenseCategory: build.mutation<
      ExpenseCategory,
      ExpenseCategoryInput
    >({
      query: (body) => ({
        url: '/expense-categories',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<ExpenseCategory>) =>
        unwrapData(response),
      invalidatesTags: [{ type: 'Expense', id: 'CATEGORIES' }],
    }),

    updateExpenseCategory: build.mutation<
      ExpenseCategory,
      { id: string; body: Partial<ExpenseCategoryInput> }
    >({
      query: ({ id, body }) => ({
        url: `/expense-categories/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<ExpenseCategory>) =>
        unwrapData(response),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Expense', id: `CAT:${id}` },
        { type: 'Expense', id: 'CATEGORIES' },
      ],
    }),

    deleteExpenseCategory: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/expense-categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Expense', id: `CAT:${id}` },
        { type: 'Expense', id: 'CATEGORIES' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} = expensesApi;
