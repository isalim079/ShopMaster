import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/src/shared/api/unwrap';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
} from '@/src/shared/api/types';

import type {
  Sale,
  SaleDetail,
  SaleInput,
  SaleInvoice,
  SaleUpdateInput,
} from '../types';

export const salesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSales: build.query<PaginatedResult<Sale>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/sales',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<Sale[]>) => unwrapList(response),
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
              { type: 'Sale' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'Sale' as const,
                id,
              })),
            ]
          : [{ type: 'Sale' as const, id: 'LIST' }],
    }),

    getSaleById: build.query<SaleDetail, string>({
      query: (id) => `/sales/${id}`,
      transformResponse: (response: ApiSuccess<SaleDetail>) =>
        unwrapData(response),
      providesTags: (_r, _e, id) => [{ type: 'Sale', id }],
    }),

    getSaleInvoice: build.query<SaleInvoice, string>({
      query: (id) => `/sales/${id}/invoice`,
      transformResponse: (response: ApiSuccess<SaleInvoice>) =>
        unwrapData(response),
      providesTags: (_r, _e, id) => [{ type: 'Sale', id: `INVOICE:${id}` }],
    }),

    createSale: build.mutation<SaleDetail, SaleInput>({
      query: (body) => ({ url: '/sales', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<SaleDetail>) =>
        unwrapData(response),
      invalidatesTags: [
        { type: 'Sale', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Dashboard', id: 'SUMMARY' },
      ],
    }),

    updateSale: build.mutation<
      SaleDetail,
      { id: string; body: SaleUpdateInput }
    >({
      query: ({ id, body }) => ({
        url: `/sales/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<SaleDetail>) =>
        unwrapData(response),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Sale', id },
        { type: 'Sale', id: 'LIST' },
      ],
    }),

    completeSale: build.mutation<SaleDetail, string>({
      query: (id) => ({
        url: `/sales/${id}/complete`,
        method: 'POST',
      }),
      transformResponse: (response: ApiSuccess<SaleDetail>) =>
        unwrapData(response),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Sale', id },
        { type: 'Sale', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'HISTORY' },
        { type: 'Payment', id: 'LIST' },
        { type: 'Dashboard', id: 'SUMMARY' },
      ],
    }),

    cancelSale: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/sales/${id}`, method: 'DELETE' }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Sale', id },
        { type: 'Sale', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useGetSaleInvoiceQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useCompleteSaleMutation,
  useCancelSaleMutation,
} = salesApi;
