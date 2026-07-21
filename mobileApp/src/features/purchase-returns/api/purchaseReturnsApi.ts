import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/src/shared/api/unwrap';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
} from '@/src/shared/api/types';

import type {
  PurchaseReturn,
  PurchaseReturnDetail,
  PurchaseReturnInput,
} from '../types';

export const purchaseReturnsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPurchaseReturns: build.query<
      PaginatedResult<PurchaseReturn>,
      ListQueryArgs
    >({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/purchase-returns',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<PurchaseReturn[]>) =>
        unwrapList(response),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...stable } = queryArgs;
        return `${endpointName}(${JSON.stringify(stable)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) <= 1) return newItems;
        const seen = new Set(currentCache.items.map((p) => p.id));
        const appended = newItems.items.filter((p) => !seen.has(p.id));
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
              { type: 'PurchaseReturn' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'PurchaseReturn' as const,
                id,
              })),
            ]
          : [{ type: 'PurchaseReturn' as const, id: 'LIST' }],
    }),

    getPurchaseReturnById: build.query<PurchaseReturnDetail, string>({
      query: (id) => `/purchase-returns/${id}`,
      transformResponse: (response: ApiSuccess<PurchaseReturnDetail>) =>
        unwrapData(response),
      providesTags: (_r, _e, id) => [{ type: 'PurchaseReturn', id }],
    }),

    createPurchaseReturn: build.mutation<
      PurchaseReturnDetail,
      PurchaseReturnInput
    >({
      query: (body) => ({
        url: '/purchase-returns',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<PurchaseReturnDetail>) =>
        unwrapData(response),
      invalidatesTags: [
        { type: 'PurchaseReturn', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'HISTORY' },
        { type: 'Purchase', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPurchaseReturnsQuery,
  useGetPurchaseReturnByIdQuery,
  useCreatePurchaseReturnMutation,
} = purchaseReturnsApi;
