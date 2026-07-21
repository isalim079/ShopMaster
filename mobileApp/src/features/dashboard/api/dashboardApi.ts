import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData } from '@/src/shared/api/unwrap';
import type { ApiSuccess } from '@/src/shared/api/types';

import type {
  DashboardSummary,
  DashboardToday,
  TopCustomerRow,
  TopProductRow,
  TopQueryArgs,
} from '../types';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSummary: build.query<DashboardSummary, void>({
      query: () => '/dashboard/summary',
      transformResponse: (response: ApiSuccess<DashboardSummary>) =>
        unwrapData(response),
      providesTags: [{ type: 'Dashboard', id: 'SUMMARY' }],
    }),

    getToday: build.query<DashboardToday, void>({
      query: () => '/dashboard/today',
      transformResponse: (response: ApiSuccess<DashboardToday>) =>
        unwrapData(response),
      providesTags: [{ type: 'Dashboard', id: 'TODAY' }],
    }),

    getTopProducts: build.query<TopProductRow[], TopQueryArgs | void>({
      query: (args) => ({
        url: '/dashboard/top-products',
        params: {
          days: args?.days ?? 30,
          limit: args?.limit ?? 10,
        },
      }),
      transformResponse: (response: ApiSuccess<TopProductRow[]>) =>
        unwrapData(response) ?? [],
      providesTags: [{ type: 'Dashboard', id: 'TOP_PRODUCTS' }],
    }),

    getTopCustomers: build.query<TopCustomerRow[], TopQueryArgs | void>({
      query: (args) => ({
        url: '/dashboard/top-customers',
        params: {
          days: args?.days ?? 30,
          limit: args?.limit ?? 10,
        },
      }),
      transformResponse: (response: ApiSuccess<TopCustomerRow[]>) =>
        unwrapData(response) ?? [],
      providesTags: [{ type: 'Dashboard', id: 'TOP_CUSTOMERS' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSummaryQuery,
  useGetTodayQuery,
  useGetTopProductsQuery,
  useGetTopCustomersQuery,
  useLazyGetSummaryQuery,
} = dashboardApi;
