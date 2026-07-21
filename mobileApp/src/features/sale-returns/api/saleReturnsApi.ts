import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/src/shared/api/unwrap';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
} from '@/src/shared/api/types';

import type { SaleReturn, SaleReturnDetail, SaleReturnInput } from '../types';

export const saleReturnsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSaleReturns: build.query<PaginatedResult<SaleReturn>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/sale-returns',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<SaleReturn[]>) =>
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
      providesTags: (result) =>
        result
          ? [
              { type: 'SaleReturn' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'SaleReturn' as const,
                id,
              })),
            ]
          : [{ type: 'SaleReturn' as const, id: 'LIST' }],
    }),

    getSaleReturnById: build.query<SaleReturnDetail, string>({
      query: (id) => `/sale-returns/${id}`,
      transformResponse: (response: ApiSuccess<SaleReturnDetail>) =>
        unwrapData(response),
      providesTags: (_r, _e, id) => [{ type: 'SaleReturn', id }],
    }),

    createSaleReturn: build.mutation<SaleReturnDetail, SaleReturnInput>({
      query: (body) => ({
        url: '/sale-returns',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<SaleReturnDetail>) =>
        unwrapData(response),
      invalidatesTags: [
        { type: 'SaleReturn', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'HISTORY' },
        { type: 'Sale', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSaleReturnsQuery,
  useGetSaleReturnByIdQuery,
  useCreateSaleReturnMutation,
} = saleReturnsApi;
