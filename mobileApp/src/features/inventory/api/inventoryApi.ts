import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/src/shared/api/unwrap';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
} from '@/src/shared/api/types';

import type {
  InventoryAdjustmentInput,
  InventoryAdjustmentResult,
  InventoryMovement,
  InventoryStock,
} from '../types';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInventoryStocks: build.query<
      PaginatedResult<InventoryStock>,
      ListQueryArgs
    >({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/inventory',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<InventoryStock[]>) =>
        unwrapList(response),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...stable } = queryArgs;
        return `${endpointName}(${JSON.stringify(stable)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) <= 1) return newItems;
        const seen = new Set(currentCache.items.map((s) => s.id));
        const appended = newItems.items.filter((s) => !seen.has(s.id));
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
              { type: 'Inventory' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'Inventory' as const,
                id,
              })),
            ]
          : [{ type: 'Inventory' as const, id: 'LIST' }],
    }),

    getInventoryHistory: build.query<
      PaginatedResult<InventoryMovement>,
      ListQueryArgs
    >({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/inventory/history',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<InventoryMovement[]>) =>
        unwrapList(response),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...stable } = queryArgs;
        return `${endpointName}(${JSON.stringify(stable)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) <= 1) return newItems;
        const seen = new Set(currentCache.items.map((m) => m.id));
        const appended = newItems.items.filter((m) => !seen.has(m.id));
        return {
          items: [...currentCache.items, ...appended],
          meta: newItems.meta,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: [{ type: 'Inventory', id: 'HISTORY' }],
    }),

    createInventoryAdjustment: build.mutation<
      InventoryAdjustmentResult,
      InventoryAdjustmentInput
    >({
      query: (body) => ({
        url: '/inventory/adjustment',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<InventoryAdjustmentResult>) =>
        unwrapData(response),
      invalidatesTags: [
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'HISTORY' },
        { type: 'Product', id: 'LIST' },
        { type: 'Dashboard', id: 'SUMMARY' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInventoryStocksQuery,
  useGetInventoryHistoryQuery,
  useCreateInventoryAdjustmentMutation,
} = inventoryApi;
