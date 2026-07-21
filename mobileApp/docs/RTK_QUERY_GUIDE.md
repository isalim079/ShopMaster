# RTK Query Guide

This document is the production standard for ShopMaster’s network data layer. All HTTP access to `http://localhost:PORT/api/v1` (and env-configured equivalents) goes through a single `baseApi` and feature `injectEndpoints` modules.

Backend envelope (success):

```json
{
  "success": true,
  "message": "Customers fetched successfully.",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

Backend envelope (error):

```json
{
  "success": false,
  "message": "Unauthorized",
  "details": {}
}
```

Mobile clients unwrap `data` / `meta` in `transformResponse` and map errors in `baseQueryWithReauth`.

---

## File layout

```
src/
  shared/
    api/
      baseApi.ts
      baseQuery.ts
      tags.ts
      types.ts
  features/
    auth/api/authApi.ts
    customers/api/customersApi.ts
    products/api/productsApi.ts
    sales/api/salesApi.ts
    ...
```

---

## Tag system

Centralize tags so invalidation stays consistent across features.

```ts
// shared/api/tags.ts
export const API_TAGS = [
  'Auth',
  'User',
  'Organization',
  'Settings',
  'Customer',
  'Supplier',
  'Brand',
  'Category',
  'Warehouse',
  'Product',
  'Inventory',
  'Purchase',
  'PurchaseReturn',
  'Sale',
  'SaleReturn',
  'Payment',
  'Expense',
  'Dashboard',
  'Report',
  'Notification',
  'Upload',
] as const;

export type ApiTag = (typeof API_TAGS)[number];
```

List vs detail convention:

- `{ type: 'Customer', id: 'LIST' }` — collection
- `{ type: 'Customer', id: customerId }` — single entity
- Optional filter buckets: `{ type: 'Customer', id: 'LIST:active' }`

---

## Shared response types

```ts
// shared/api/types.ts
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  success: false;
  message: string;
  details?: unknown;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ListQueryArgs {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}
```

---

## Base query with refresh token flow

ShopMaster auth supports refresh via body (`refreshToken`) as well as cookies. Native clients **always** send:

- `Authorization: Bearer <accessToken>`
- `POST /auth/refresh-token` with `{ refreshToken }` in JSON body

Tokens live in Expo Secure Store — never in Redux.

```ts
// shared/api/baseQuery.ts
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';

import { env } from '@/shared/config/env';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '@/features/auth/services/tokenStorage';
import { sessionExpired } from '@/features/auth/authSlice';
import type { RootState, AppDispatch } from '@/app/store';

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.API_BASE_URL, // e.g. http://10.0.2.2:5000/api/v1
  prepareHeaders: async (headers) => {
    const token = await getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    return headers;
  },
});

type RefreshSuccess = {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          api.dispatch(sessionExpired());
          await clearTokens();
          return result;
        }

        const refreshResult = await rawBaseQuery(
          {
            url: '/auth/refresh-token',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions,
        );

        const payload = refreshResult.data as RefreshSuccess | undefined;
        const nextAccess =
          payload?.data?.accessToken ??
          // tolerate top-level tokens if API returns them without nested data
          (refreshResult.data as { accessToken?: string } | undefined)
            ?.accessToken;
        const nextRefresh =
          payload?.data?.refreshToken ??
          (refreshResult.data as { refreshToken?: string } | undefined)
            ?.refreshToken;

        if (nextAccess && nextRefresh) {
          await setTokens({
            accessToken: nextAccess,
            refreshToken: nextRefresh,
          });
          result = await rawBaseQuery(args, api, extraOptions);
        } else if (
          refreshResult.meta &&
          'response' in refreshResult.meta &&
          (refreshResult.meta.response as Response | undefined)?.ok
        ) {
          // Cookie-only refresh succeeded but body has no tokens — mobile cannot continue.
          api.dispatch(sessionExpired());
          await clearTokens();
        } else {
          api.dispatch(sessionExpired());
          await clearTokens();
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
```

### Refresh contract for mobile

Login and refresh responses used by the app must expose tokens in JSON (cookies alone are insufficient on React Native). Expected shapes:

**Login** — `POST /auth/login`

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "id": "...", "email": "...", "organization": {}, "role": {} },
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>"
    }
  }
}
```

**Refresh** — `POST /auth/refresh-token`

```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

If the deployed API currently returns tokens only via `Set-Cookie`, extend the auth controller for native clients so `data` includes the tokens above. The mobile layer assumes body tokens.

---

## baseApi

```ts
// shared/api/baseApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_TAGS } from './tags';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [...API_TAGS],
  endpoints: () => ({}),
  keepUnusedDataFor: 60,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 30,
});
```

Register in the store:

```ts
middleware: (gDM) => gDM().concat(baseApi.middleware),
reducer: { [baseApi.reducerPath]: baseApi.reducer, ...slices },
```

Call `setupListeners(store.dispatch)` so focus/reconnect refetch works with React Native AppState (wire AppState → `api.util` listeners as needed).

---

## injectEndpoints pattern

Every feature owns its API file and injects into `baseApi`. Never create a second `createApi` for REST.

```ts
// features/customers/api/customersApi.ts
import { baseApi } from '@/shared/api/baseApi';
import type {
  ApiSuccess,
  ListQueryArgs,
  PaginatedResult,
  PaginationMeta,
} from '@/shared/api/types';
import type { Customer, CustomerInput } from '../types';

function unwrapList(
  response: ApiSuccess<Customer[]>,
): PaginatedResult<Customer> {
  return {
    items: response.data ?? [],
    meta: response.meta as PaginationMeta,
  };
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<PaginatedResult<Customer>, ListQueryArgs>({
      query: (params) => ({
        url: '/customers',
        params,
      }),
      transformResponse: (response: ApiSuccess<Customer[]>) =>
        unwrapList(response),
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
      invalidatesTags: (_r, _e, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useLazyGetCustomersQuery,
} = customersApi;
```

Apply the same pattern for suppliers, brands, categories, warehouses, products, inventory, purchases, purchase-returns, sales, sale-returns, payments, expenses, dashboard, reports, notifications, settings, organizations, and uploads.

---

## Caching rules

| Setting | Default | Guidance |
| --- | --- | --- |
| `keepUnusedDataFor` | `60` | Raise for reference data (brands, categories, warehouses) to `300` |
| `refetchOnMountOrArgChange` | `30` | Use `true` for money-critical screens (sales, payments) |
| `refetchOnReconnect` | `true` | Keep enabled — pairs with offline sync |
| `refetchOnFocus` | `true` | Keep for dashboard / notifications |

Per-endpoint override:

```ts
getBrands: build.query({
  query: () => '/brands',
  keepUnusedDataFor: 300,
  // ...
}),
```

---

## Tag invalidation matrix

| Mutation | Invalidate |
| --- | --- |
| Create entity | `LIST` for that tag |
| Update entity | entity `id` + `LIST` |
| Delete entity | entity `id` + `LIST` |
| Complete sale | `Sale`, `Inventory`, `Payment`, `Dashboard` |
| Stock adjustment | `Inventory`, `Product`, `Dashboard` |
| Create payment | `Payment`, `Sale` or `Purchase`, `Dashboard` |
| Update settings | `Settings` |
| Upload file | `Upload` (+ parent entity if attached) |

Prefer precise tags over `invalidatesTags: ['Sale']` which drops the entire cache for that type.

Cross-module example:

```ts
completeSale: build.mutation({
  query: (id) => ({ url: `/sales/${id}/complete`, method: 'POST' }),
  invalidatesTags: (_r, _e, id) => [
    { type: 'Sale', id },
    { type: 'Sale', id: 'LIST' },
    { type: 'Inventory', id: 'LIST' },
    { type: 'Dashboard', id: 'SUMMARY' },
  ],
}),
```

---

## Pagination

ShopMaster list endpoints use `page`, `limit`, and return `meta: { page, limit, total, totalPages }`.

```ts
getProducts: build.query<PaginatedResult<Product>, ListQueryArgs>({
  query: ({ page = 1, limit = 20, ...rest }) => ({
    url: '/products',
    params: { page, limit, ...rest },
  }),
  transformResponse: (response: ApiSuccess<Product[]>) => ({
    items: response.data ?? [],
    meta: response.meta as PaginationMeta,
  }),
  providesTags: (result) =>
    result
      ? [
          { type: 'Product', id: 'LIST' },
          ...result.items.map((p) => ({ type: 'Product' as const, id: p.id })),
        ]
      : [{ type: 'Product', id: 'LIST' }],
}),
```

UI (page buttons / “Load more” that replaces page):

```tsx
const [page, setPage] = useState(1);
const { data, isFetching } = useGetProductsQuery({ page, limit: 20 });

const totalPages = data?.meta.totalPages ?? 1;
```

---

## Infinite scroll

Use RTK Query’s `serializeQueryArgs` + `merge` + `forceRefetch` pattern with FlashList.

```ts
getSalesInfinite: build.query<PaginatedResult<Sale>, ListQueryArgs>({
  query: ({ page = 1, limit = 20, ...rest }) => ({
    url: '/sales',
    params: { page, limit, ...rest },
  }),
  transformResponse: (response: ApiSuccess<Sale[]>) => ({
    items: response.data ?? [],
    meta: response.meta as PaginationMeta,
  }),
  serializeQueryArgs: ({ endpointName, queryArgs }) => {
    const { page: _page, ...stable } = queryArgs;
    return `${endpointName}(${JSON.stringify(stable)})`;
  },
  merge: (currentCache, newItems, { arg }) => {
    if ((arg.page ?? 1) <= 1) {
      return newItems;
    }
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
          { type: 'Sale', id: 'LIST' },
          ...result.items.map((s) => ({ type: 'Sale' as const, id: s.id })),
        ]
      : [{ type: 'Sale', id: 'LIST' }],
}),
```

FlashList wiring:

```tsx
const [page, setPage] = useState(1);
const { data, isFetching, isLoading, refetch } = useGetSalesInfiniteQuery({
  page,
  limit: 20,
  status: statusFilter,
});

const onEndReached = () => {
  if (isFetching) return;
  const totalPages = data?.meta.totalPages ?? 1;
  if (page < totalPages) setPage((p) => p + 1);
};

return (
  <FlashList
    data={data?.items ?? []}
    onEndReached={onEndReached}
    onEndReachedThreshold={0.4}
    refreshing={isLoading}
    onRefresh={() => {
      setPage(1);
      refetch();
    }}
    renderItem={({ item }) => <SaleRow sale={item} />}
  />
);
```

When filters change, reset `page` to `1` in the same render cycle (or `useEffect`) so `merge` replaces the cache.

---

## Optimistic updates

Use for snappy UX on updates/deletes that are safe to roll back. Always pair with `onQueryStarted` undo.

```ts
updateCustomer: build.mutation({
  query: ({ id, body }) => ({
    url: `/customers/${id}`,
    method: 'PATCH',
    body,
  }),
  transformResponse: (response: ApiSuccess<Customer>) => response.data,
  async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
    const patch = dispatch(
      customersApi.util.updateQueryData('getCustomerById', id, (draft) => {
        Object.assign(draft, body);
      }),
    );
    try {
      await queryFulfilled;
    } catch {
      patch.undo();
    }
  },
  invalidatesTags: (_r, _e, { id }) => [
    { type: 'Customer', id },
    { type: 'Customer', id: 'LIST' },
  ],
}),
```

Rules:

- Optimistic for rename / status toggles / soft fields
- **Not** optimistic for payments, stock adjustments, sale completion, or anything that must match server totals before UI confirms
- Offline writes go to the outbox first (see [OFFLINE_FIRST.md](./OFFLINE_FIRST.md)); do not double-apply optimism and outbox without a single code path

---

## Error handling

Normalize backend errors once:

```ts
// shared/api/error.ts
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

export interface AppApiError {
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR';
  message: string;
  details?: unknown;
}

export function toAppApiError(
  error: FetchBaseQueryError | SerializedError | undefined,
): AppApiError {
  if (!error) {
    return { status: 'CUSTOM_ERROR', message: 'Unknown error' };
  }

  if ('status' in error) {
    const data = error.data as { message?: string; details?: unknown } | undefined;
    return {
      status: error.status as AppApiError['status'],
      message: data?.message ?? 'Request failed',
      details: data?.details,
    };
  }

  return {
    status: 'CUSTOM_ERROR',
    message: error.message ?? 'Request failed',
  };
}
```

In UI:

```tsx
const [createCustomer, { isLoading, error }] = useCreateCustomerMutation();
const apiError = toAppApiError(error);

// show apiError.message in Snackbar / inline alert
```

Map HTTP status to UX:

| Status | UX |
| --- | --- |
| 400 / 422 | Inline field or form error from `message` / `details` |
| 401 | Refresh flow; if still failing → login |
| 403 | Permission empty state |
| 404 | Not found state |
| 409 | Conflict dialog (email exists, stock conflict) |
| 5xx | Retry CTA |
| `FETCH_ERROR` | Offline banner + queue write if applicable |

---

## Retry logic

RTK Query does not retry mutations by default (correct). For idempotent GETs, wrap the base query:

```ts
// shared/api/baseQueryWithRetry.ts
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseQueryWithReauth } from './baseQuery';

const MAX_RETRIES = 2;
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const baseQueryWithRetry: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const method =
    typeof args === 'string' ? 'GET' : (args.method ?? 'GET').toUpperCase();

  let attempt = 0;
  let result = await baseQueryWithReauth(args, api, extraOptions);

  while (
    result.error &&
    method === 'GET' &&
    attempt < MAX_RETRIES &&
    typeof result.error.status === 'number' &&
    RETRYABLE.has(result.error.status)
  ) {
    attempt += 1;
    await sleep(300 * 2 ** (attempt - 1));
    result = await baseQueryWithReauth(args, api, extraOptions);
  }

  return result;
};
```

Point `createApi({ baseQuery: baseQueryWithRetry })` at this wrapper.

Mutation retries belong in the **sync engine** outbox (exponential backoff), not in RTK Query.

---

## Auth endpoints via RTK Query

```ts
// features/auth/api/authApi.ts
import { baseApi } from '@/shared/api/baseApi';
import type { ApiSuccess } from '@/shared/api/types';
import type {
  LoginRequest,
  LoginResult,
  RegisterRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types';
import { setTokens, clearTokens } from '../services/tokenStorage';
import { setSessionUser, clearSession } from '../authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<{ message: string }, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (r: ApiSuccess<unknown>) => ({ message: r.message }),
    }),

    verifyEmail: build.mutation<{ message: string }, VerifyEmailRequest>({
      query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }),
      transformResponse: (r: ApiSuccess<unknown>) => ({ message: r.message }),
    }),

    resendVerification: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body,
      }),
      transformResponse: (r: ApiSuccess<unknown>) => ({ message: r.message }),
    }),

    login: build.mutation<LoginResult, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (r: ApiSuccess<LoginResult>) => r.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await setTokens(data.tokens);
          dispatch(setSessionUser(data.user));
        } catch {
          // UI handles error
        }
      },
    }),

    logout: build.mutation<{ message: string }, void>({
      async queryFn(_arg, api, _extra, baseQuery) {
        const refreshToken = await (
          await import('../services/tokenStorage')
        ).getRefreshToken();
        const result = await baseQuery({
          url: '/auth/logout',
          method: 'POST',
          body: { refreshToken },
        });
        await clearTokens();
        api.dispatch(clearSession());
        api.dispatch(baseApi.util.resetApiState());
        if (result.error) {
          return { error: result.error };
        }
        return {
          data: { message: (result.data as ApiSuccess<unknown>).message },
        };
      },
    }),

    forgotPassword: build.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
      transformResponse: (r: ApiSuccess<unknown>) => ({ message: r.message }),
    }),

    verifyResetOtp: build.mutation<{ resetToken: string }, VerifyEmailRequest>({
      query: (body) => ({
        url: '/auth/verify-reset-otp',
        method: 'POST',
        body,
      }),
      transformResponse: (r: ApiSuccess<{ resetToken: string }>) => r.data,
    }),

    resetPassword: build.mutation<{ message: string }, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
      transformResponse: (r: ApiSuccess<unknown>) => ({ message: r.message }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} = authApi;
```

---

## Manual cache updates & prefetch

```ts
dispatch(
  customersApi.endpoints.getCustomerById.initiate(id, { forceRefetch: true }),
);

dispatch(
  customersApi.util.prefetch('getCustomers', { page: 1, limit: 20 }, { force: false }),
);

dispatch(customersApi.util.invalidateTags([{ type: 'Dashboard', id: 'SUMMARY' }]));
```

On logout always:

```ts
dispatch(baseApi.util.resetApiState());
```

---

## Testing endpoints

- Prefer testing `transformResponse` and tag lists as pure functions
- Integration-test `baseQueryWithReauth` with a mocked `fetch` and Secure Store
- UI tests mock hooks (`useGetCustomersQuery`) rather than hitting the network

---

## Do / Don’t

| Do | Don’t |
| --- | --- |
| One `baseApi` | Multiple `createApi` for REST |
| `injectEndpoints` per feature | Giant single endpoints file |
| Unwrap envelope in `transformResponse` | Make every screen dig into `success/data` |
| Tag lists + ids | Invalidate entire `tagTypes` casually |
| Mutex around refresh | Parallel refresh storms |
| Outbox retries for writes | Blind mutation retries in baseQuery |

---

## Related docs

- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
- [API_INTEGRATION.md](./API_INTEGRATION.md)
- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [OFFLINE_FIRST.md](./OFFLINE_FIRST.md)
- [SYNC_ENGINE.md](./SYNC_ENGINE.md)
