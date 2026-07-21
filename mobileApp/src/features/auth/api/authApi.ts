import { baseApi } from '@/src/shared/api/baseApi';
import type { ApiSuccess } from '@/src/shared/api/types';
import type { AuthUser } from '@/src/features/auth/slices/authSlice';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type RegisterBody = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  organizationName: string;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<LoginResponse>) => response.data,
    }),
    register: build.mutation<{ message: string }, RegisterBody>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
    }),
    verifyEmail: build.mutation<{ message: string }, { email: string; otp: string }>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
    }),
    resendVerification: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
    }),
    logout: build.mutation<{ message: string }, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<unknown>) => ({
        message: response.message,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLogoutMutation,
} = authApi;
