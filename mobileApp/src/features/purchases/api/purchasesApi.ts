import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/src/shared/api/unwrap';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
} from '@/src/shared/api/types';

import type {
  Purchase,
  PurchaseDetail,
  PurchaseInput,
  ReceivePurchaseInput,
} from '../types';

export const purchasesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPurchases: build.query<PaginatedResult<Purchase>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/purchases',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<Purchase[]>) => unwrapList(response),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...stable } = queryArgs;
        return `${endpointName}(${JSON.stringify(stable)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) <= 1) return newItems;
        const seen = new Set(currentCache.items.map((p) => p.id));
        const appended = newItems.items.filter((p) => !seen.has(p.id));
        return { items: [...currentCache.items, ...appended], meta: newItems.meta };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: (result) =>
        result
          ? [
              { type: 'Purchase' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({ type: 'Purchase' as const, id })),
            ]
          : [{ type: 'Purchase' as const, id: 'LIST' }],
    }),

    getPurchaseById: build.query<PurchaseDetail, string>({
      query: (id) => `/purchases/${id}`,
      transformResponse: (response: ApiSuccess<PurchaseDetail>) => unwrapData(response),
      providesTags: (_r, _e, id) => [{ type: 'Purchase', id }],
    }),

    createPurchase: build.mutation<PurchaseDetail, PurchaseInput>({
      query: (body) => ({ url: '/purchases', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<PurchaseDetail>) => unwrapData(response),
      invalidatesTags: [{ type: 'Purchase', id: 'LIST' }],
    }),

    receivePurchase: build.mutation<
      PurchaseDetail,
      { id: string; body: ReceivePurchaseInput }
    >({
      query: ({ id, body }) => ({
        url: `/purchases/${id}/receive`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<PurchaseDetail>) => unwrapData(response),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Purchase', id },
        { type: 'Purchase', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'HISTORY' },
        { type: 'Dashboard', id: 'SUMMARY' },
      ],
    }),

    cancelPurchase: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/purchases/${id}`, method: 'DELETE' }),
      transformResponse: (response: ApiSuccess<unknown>) => ({ message: response.message }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Purchase', id },
        { type: 'Purchase', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useCreatePurchaseMutation,
  useReceivePurchaseMutation,
  useCancelPurchaseMutation,
} = purchasesApi;
