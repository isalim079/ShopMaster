import { baseApi } from '@/src/shared/api/baseApi';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
  PaginationMeta,
} from '@/src/shared/api/types';
import type { Category, CategoryInput } from '../types';

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<PaginatedResult<Category>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/categories',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<Category[]>) => ({
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
              { type: 'Category' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'Category' as const,
                id,
              })),
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),

    getCategoryById: build.query<Category, string>({
      query: (id) => `/categories/${id}`,
      transformResponse: (response: ApiSuccess<Category>) => response.data,
      providesTags: (_r, _e, id) => [{ type: 'Category', id }],
    }),

    createCategory: build.mutation<Category, CategoryInput>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<Category>) => response.data,
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updateCategory: build.mutation<
      Category,
      { id: string; body: Partial<CategoryInput> }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<Category>) => response.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    deleteCategory: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
