import { baseApi } from '@/src/shared/api/baseApi';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
  PaginationMeta,
} from '@/src/shared/api/types';
import type { Supplier, SupplierInput } from '../types';

export const supplierApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSuppliers: build.query<PaginatedResult<Supplier>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/suppliers',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<Supplier[]>) => ({
        items: response.data ?? [],
        meta: response.meta as PaginationMeta,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...stable } = queryArgs;
        return `${endpointName}(${JSON.stringify(stable)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if ((arg.page ?? 1) <= 1) return newItems;
        const seen = new Set(currentCache.items.map((item) => item.id));
        return {
          items: [
            ...currentCache.items,
            ...newItems.items.filter((item) => !seen.has(item.id)),
          ],
          meta: newItems.meta,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: (result) =>
        result
          ? [
              { type: 'Supplier' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'Supplier' as const,
                id,
              })),
            ]
          : [{ type: 'Supplier' as const, id: 'LIST' }],
    }),

    getSupplierById: build.query<Supplier, string>({
      query: (id) => `/suppliers/${id}`,
      transformResponse: (response: ApiSuccess<Supplier>) => response.data,
      providesTags: (_r, _e, id) => [{ type: 'Supplier', id }],
    }),

    createSupplier: build.mutation<Supplier, SupplierInput>({
      query: (body) => ({
        url: '/suppliers',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<Supplier>) => response.data,
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),

    updateSupplier: build.mutation<
      Supplier,
      { id: string; body: Partial<SupplierInput> }
    >({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<Supplier>) => response.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),

    deleteSupplier: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;
