import { baseApi } from '@/src/shared/api/baseApi';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
  PaginationMeta,
} from '@/src/shared/api/types';
import type { Customer, CustomerInput } from '../types';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<PaginatedResult<Customer>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/customers',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<Customer[]>) => ({
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
              { type: 'Customer' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'Customer' as const,
                id,
              })),
            ]
          : [{ type: 'Customer' as const, id: 'LIST' }],
    }),

    getCustomerById: build.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      transformResponse: (response: ApiSuccess<Customer>) => response.data,
      providesTags: (_r, _e, id) => [{ type: 'Customer', id }],
    }),

    createCustomer: build.mutation<Customer, CustomerInput>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<Customer>) => response.data,
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),

    updateCustomer: build.mutation<
      Customer,
      { id: string; body: Partial<CustomerInput> }
    >({
      query: ({ id, body }) => ({
        url: `/customers/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<Customer>) => response.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),

    deleteCustomer: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;
