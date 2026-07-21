import { baseApi } from '@/src/shared/api/baseApi';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
  PaginationMeta,
} from '@/src/shared/api/types';
import type { Brand, BrandInput } from '../types';

export const brandApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBrands: build.query<PaginatedResult<Brand>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/brands',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<Brand[]>) => ({
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
              { type: 'Brand' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'Brand' as const,
                id,
              })),
            ]
          : [{ type: 'Brand' as const, id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),

    getBrandById: build.query<Brand, string>({
      query: (id) => `/brands/${id}`,
      transformResponse: (response: ApiSuccess<Brand>) => response.data,
      providesTags: (_r, _e, id) => [{ type: 'Brand', id }],
    }),

    createBrand: build.mutation<Brand, BrandInput>({
      query: (body) => ({
        url: '/brands',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<Brand>) => response.data,
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),

    updateBrand: build.mutation<
      Brand,
      { id: string; body: Partial<BrandInput> }
    >({
      query: ({ id, body }) => ({
        url: `/brands/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<Brand>) => response.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Brand', id },
        { type: 'Brand', id: 'LIST' },
      ],
    }),

    deleteBrand: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Brand', id },
        { type: 'Brand', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;
