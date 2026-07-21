import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { env } from '@/src/shared/config/env';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/src/features/auth/services/tokenStorage';
import { clearSession } from '@/src/features/auth/slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.API_BASE_URL,
  prepareHeaders: async (headers) => {
    const accessToken = await getAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    headers.set('Accept', 'application/json');
    return headers;
  },
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const result = await rawBaseQuery(
    {
      url: '/auth/refresh-token',
      method: 'POST',
      body: { refreshToken },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any,
    {},
  );

  if (result.error) {
    return false;
  }

  const data = result.data as {
    data?: { tokens?: { accessToken: string; refreshToken: string } };
  };

  const tokens = data?.data?.tokens;
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    return false;
  }

  await setTokens(tokens);
  return true;
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      await clearTokens();
      api.dispatch(clearSession());
    }
  }

  return result;
};
