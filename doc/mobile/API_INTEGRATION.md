# ShopMaster — API Integration

> HTTP client: **Axios**
> Server state: **React Query (TanStack Query v5)**
> Token management: **Axios interceptors + AsyncStorage**

---

## Table of Contents

1. [Axios Instance Setup](#axios-instance-setup)
2. [Auth Interceptors (Token Refresh)](#auth-interceptors-token-refresh)
3. [Service Layer](#service-layer)
4. [React Query Setup](#react-query-setup)
5. [Query Hooks](#query-hooks)
6. [Mutation Hooks](#mutation-hooks)
7. [Error Handling](#error-handling)
8. [Environment Config](#environment-config)

---

## Axios Instance Setup

```typescript
// services/api.ts
// Central Axios instance — all requests go through here

import axios from 'axios';
import { API_BASE_URL } from '@/constants/env';

// Create the Axios instance with base config
export const api = axios.create({
  baseURL: API_BASE_URL,       // e.g. https://api.shopmaster.app/api/v1
  timeout: 15000,              // 15s timeout — avoid hanging requests
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
```

---

## Auth Interceptors (Token Refresh)

The request interceptor attaches the access token. The response interceptor handles `401` by refreshing the token and retrying the original request.

```typescript
// services/api.ts (continued)

import { storage } from '@/utils/storage.util';
import { store } from '@/store';
import { logout, setTokens } from '@/store/auth.slice';

// ────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR — attach access token to every request
// ────────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const accessToken = await storage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Tracks if a token refresh is already in progress to avoid
// making multiple simultaneous refresh requests.
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

// ────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — auto-refresh on 401
// ────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        // Call the refresh endpoint (no interceptors on this call)
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const newAccessToken = data.data.accessToken;

        // Save the new access token and retry queued requests
        await storage.setAccessToken(newAccessToken);
        store.dispatch(setTokens({ accessToken: newAccessToken }));

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — log the user out
        processQueue(refreshError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
```

---

## Service Layer

Each feature has a service file that wraps API calls:

```typescript
// services/category.service.ts
// Thin wrappers around Axios calls — one function per API endpoint

import { api } from './api';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/category.type';
import type { ApiResponse, PaginatedResponse } from '@/types/api.type';

/** Fetch all categories for the current user */
export const categoryService = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Category>>>('/categories', { params }),

  getOne: (id: string) =>
    api.get<ApiResponse<Category>>(`/categories/${id}`),

  create: (data: CreateCategoryInput) =>
    api.post<ApiResponse<Category>>('/categories', data),

  update: (id: string, data: UpdateCategoryInput) =>
    api.patch<ApiResponse<Category>>(`/categories/${id}`, data),

  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/categories/${id}`),
};
```

---

## React Query Setup

```typescript
// app/_layout.tsx — provider setup

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes — data is fresh for 5 min
      gcTime: 1000 * 60 * 10,        // 10 minutes — cache kept for 10 min
      retry: 2,                       // retry failed requests twice
      refetchOnWindowFocus: false,    // mobile apps don't have window focus
    },
    mutations: {
      retry: 0,                       // don't retry mutations (transactions)
    },
  },
});

// Wrap the app
<QueryClientProvider client={queryClient}>
  <RootNavigator />
</QueryClientProvider>
```

---

## Query Hooks

Query keys are defined as constants to avoid typos:

```typescript
// services/query-keys.ts
export const queryKeys = {
  categories: {
    all:    ['categories'] as const,
    list:   (params?: object) => ['categories', 'list', params] as const,
    detail: (id: string)    => ['categories', 'detail', id]    as const,
  },
  products: {
    all:    ['products'] as const,
    list:   (params?: object) => ['products', 'list', params]  as const,
    detail: (id: string)    => ['products', 'detail', id]     as const,
  },
  transactions: {
    list: (params?: object) => ['transactions', 'list', params] as const,
  },
  reports: {
    summary:    ['reports', 'summary'] as const,
    daily:      (date: string)   => ['reports', 'daily', date]          as const,
    monthly:    (y: number, m: number) => ['reports', 'monthly', y, m]  as const,
    dateRange:  (start: string, end: string) => ['reports', 'range', start, end] as const,
  },
};
```

### Category query hooks

```typescript
// hooks/queries/useCategories.ts

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { queryKeys } from '@/services/query-keys';

/** Fetch all categories */
export const useCategories = (params?: { search?: string }) =>
  useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => categoryService.getAll(params).then((res) => res.data.data),
  });

/** Fetch a single category by ID */
export const useCategory = (id: string) =>
  useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoryService.getOne(id).then((res) => res.data.data),
    enabled: !!id,    // don't run if id is empty
  });
```

---

## Mutation Hooks

```typescript
// hooks/mutations/useCategoryMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { queryKeys } from '@/services/query-keys';
import { toast } from '@/utils/toast.util';

/** Create a new category */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.create,
    onSuccess: (res) => {
      // Invalidate the category list so it refetches
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success('Category created successfully.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

/** Delete a category — optimistic update */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.remove,
    onMutate: async (id) => {
      // Cancel any refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all });

      // Snapshot current data for rollback
      const previous = queryClient.getQueryData(queryKeys.categories.list());

      // Optimistically remove from cache
      queryClient.setQueryData(queryKeys.categories.list(), (old: any) => ({
        ...old,
        categories: old.categories.filter((c: any) => c.id !== id),
      }));

      return { previous };
    },
    onError: (err, id, context) => {
      // Rollback on failure
      queryClient.setQueryData(queryKeys.categories.list(), context?.previous);
      toast.error(getApiErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
};
```

---

## Error Handling

```typescript
// utils/api-error.util.ts

import axios from 'axios';

/** Extract a user-friendly message from any API error */
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Server returned a response with our standard error body
    const serverMessage = error.response?.data?.message;
    if (serverMessage) return serverMessage;

    // Network error (no response)
    if (!error.response) return 'No internet connection. Please check your network.';

    // HTTP errors without our standard body
    if (error.response.status === 429) return 'Too many requests. Please wait a moment.';
    if (error.response.status >= 500) return 'Server error. Please try again later.';
  }

  return 'Something went wrong. Please try again.';
};
```

---

## Environment Config

```typescript
// constants/env.ts

// Expo exposes env variables prefixed with EXPO_PUBLIC_ to the client bundle
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

// .env file
// EXPO_PUBLIC_API_URL=https://api.shopmaster.app/api/v1
```
