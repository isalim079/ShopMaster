import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/src/shared/api/unwrap';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
} from '@/src/shared/api/types';

import type {
  Product,
  ProductDetail,
  ProductInput,
  ProductUpdateInput,
} from '../types';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<PaginatedResult<Product>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/products',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<Product[]>) =>
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
              { type: 'Product' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'Product' as const,
                id,
              })),
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    getProductById: build.query<ProductDetail, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: ApiSuccess<ProductDetail>) =>
        unwrapData(response),
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),

    createProduct: build.mutation<Product, ProductInput>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<Product>) => unwrapData(response),
      invalidatesTags: [
        { type: 'Product', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),

    updateProduct: build.mutation<
      Product,
      { id: string; body: ProductUpdateInput }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<Product>) => unwrapData(response),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
