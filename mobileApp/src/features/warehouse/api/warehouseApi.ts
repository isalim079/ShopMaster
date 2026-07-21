import { baseApi } from '@/src/shared/api/baseApi';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
  PaginationMeta,
} from '@/src/shared/api/types';
import type { Warehouse, WarehouseInput } from '../types';

export const warehouseApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWarehouses: build.query<PaginatedResult<Warehouse>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/warehouses',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<Warehouse[]>) => ({
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
              { type: 'Warehouse' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'Warehouse' as const,
                id,
              })),
            ]
          : [{ type: 'Warehouse' as const, id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),

    getWarehouseById: build.query<Warehouse, string>({
      query: (id) => `/warehouses/${id}`,
      transformResponse: (response: ApiSuccess<Warehouse>) => response.data,
      providesTags: (_r, _e, id) => [{ type: 'Warehouse', id }],
    }),

    createWarehouse: build.mutation<Warehouse, WarehouseInput>({
      query: (body) => ({
        url: '/warehouses',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<Warehouse>) => response.data,
      invalidatesTags: [{ type: 'Warehouse', id: 'LIST' }],
    }),

    updateWarehouse: build.mutation<
      Warehouse,
      { id: string; body: Partial<WarehouseInput> }
    >({
      query: ({ id, body }) => ({
        url: `/warehouses/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<Warehouse>) => response.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Warehouse', id },
        { type: 'Warehouse', id: 'LIST' },
      ],
    }),

    deleteWarehouse: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/warehouses/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Warehouse', id },
        { type: 'Warehouse', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useGetWarehouseByIdQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;
