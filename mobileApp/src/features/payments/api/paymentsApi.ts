import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/src/shared/api/unwrap';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
} from '@/src/shared/api/types';

import type { Payment, PaymentInput } from '../types';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPayments: build.query<PaginatedResult<Payment>, ListQueryArgs>({
      query: ({ page = 1, limit = 20, ...rest }) => ({
        url: '/payments',
        params: { page, limit, ...rest },
      }),
      transformResponse: (response: ApiSuccess<Payment[]>) =>
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
              { type: 'Payment' as const, id: 'LIST' },
              ...result.items.map(({ id }) => ({
                type: 'Payment' as const,
                id,
              })),
            ]
          : [{ type: 'Payment' as const, id: 'LIST' }],
    }),

    createPayment: build.mutation<Payment, PaymentInput>({
      query: (body) => ({
        url: '/payments',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<Payment>) => unwrapData(response),
      invalidatesTags: [
        { type: 'Payment', id: 'LIST' },
        { type: 'Sale', id: 'LIST' },
        { type: 'Purchase', id: 'LIST' },
        { type: 'Dashboard', id: 'SUMMARY' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPaymentsQuery, useCreatePaymentMutation } = paymentsApi;
