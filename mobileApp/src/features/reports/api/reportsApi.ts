import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/src/shared/api/unwrap';
import type {
  ApiSuccess,
  PaginatedResult,
} from '@/src/shared/api/types';

import type {
  ExpensesReportQuery,
  ExpensesReportRow,
  InventoryReportQuery,
  InventoryReportRow,
  ProfitLossQuery,
  ProfitLossReport,
  PurchasesReportQuery,
  PurchasesReportRow,
  SalesReportQuery,
  SalesReportRow,
} from '../types';

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSalesReport: build.query<
      PaginatedResult<SalesReportRow>,
      SalesReportQuery
    >({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/reports/sales',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<SalesReportRow[]>) =>
        unwrapList(response),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...stable } = queryArgs;
        return `${endpointName}(${JSON.stringify(stable)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) <= 1) return newItems;
        const seen = new Set(currentCache.items.map((r) => r.id));
        const appended = newItems.items.filter((r) => !seen.has(r.id));
        return {
          items: [...currentCache.items, ...appended],
          meta: newItems.meta,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: [{ type: 'Report', id: 'SALES' }],
    }),

    getPurchasesReport: build.query<
      PaginatedResult<PurchasesReportRow>,
      PurchasesReportQuery
    >({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/reports/purchases',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<PurchasesReportRow[]>) =>
        unwrapList(response),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...stable } = queryArgs;
        return `${endpointName}(${JSON.stringify(stable)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) <= 1) return newItems;
        const seen = new Set(currentCache.items.map((r) => r.id));
        const appended = newItems.items.filter((r) => !seen.has(r.id));
        return {
          items: [...currentCache.items, ...appended],
          meta: newItems.meta,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: [{ type: 'Report', id: 'PURCHASES' }],
    }),

    getInventoryReport: build.query<
      PaginatedResult<InventoryReportRow>,
      InventoryReportQuery
    >({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/reports/inventory',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<InventoryReportRow[]>) =>
        unwrapList(response),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...stable } = queryArgs;
        return `${endpointName}(${JSON.stringify(stable)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) <= 1) return newItems;
        const key = (r: InventoryReportRow) =>
          `${r.productId}:${r.warehouseId}`;
        const seen = new Set(currentCache.items.map(key));
        const appended = newItems.items.filter((r) => !seen.has(key(r)));
        return {
          items: [...currentCache.items, ...appended],
          meta: newItems.meta,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: [{ type: 'Report', id: 'INVENTORY' }],
    }),

    getExpensesReport: build.query<
      PaginatedResult<ExpensesReportRow>,
      ExpensesReportQuery
    >({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/reports/expenses',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<ExpensesReportRow[]>) =>
        unwrapList(response),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...stable } = queryArgs;
        return `${endpointName}(${JSON.stringify(stable)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) <= 1) return newItems;
        const seen = new Set(currentCache.items.map((r) => r.id));
        const appended = newItems.items.filter((r) => !seen.has(r.id));
        return {
          items: [...currentCache.items, ...appended],
          meta: newItems.meta,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: [{ type: 'Report', id: 'EXPENSES' }],
    }),

    getProfitLossReport: build.query<ProfitLossReport, ProfitLossQuery | void>({
      query: (args) => ({
        url: '/reports/profit-loss',
        params: {
          from: args?.from,
          to: args?.to,
        },
      }),
      transformResponse: (response: ApiSuccess<ProfitLossReport>) =>
        unwrapData(response),
      providesTags: [{ type: 'Report', id: 'PROFIT_LOSS' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalesReportQuery,
  useGetPurchasesReportQuery,
  useGetInventoryReportQuery,
  useGetExpensesReportQuery,
  useGetProfitLossReportQuery,
} = reportsApi;
