import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData } from '@/src/shared/api/unwrap';
import type { ApiSuccess } from '@/src/shared/api/types';

import type {
  OrganizationProfile,
  UpdateOrganizationInput,
  UpdateProfileInput,
  UserProfile,
} from '../types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<UserProfile, void>({
      query: () => '/users/me',
      transformResponse: (response: ApiSuccess<UserProfile>) =>
        unwrapData(response),
      providesTags: [{ type: 'User', id: 'ME' }],
    }),

    updateMe: build.mutation<UserProfile, UpdateProfileInput>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<UserProfile>) =>
        unwrapData(response),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),

    getMyOrganization: build.query<OrganizationProfile, void>({
      query: () => '/organizations/me',
      transformResponse: (response: ApiSuccess<OrganizationProfile>) =>
        unwrapData(response),
      providesTags: [{ type: 'Organization', id: 'ME' }],
    }),

    updateMyOrganization: build.mutation<
      OrganizationProfile,
      UpdateOrganizationInput
    >({
      query: (body) => ({
        url: '/organizations/me',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<OrganizationProfile>) =>
        unwrapData(response),
      invalidatesTags: [{ type: 'Organization', id: 'ME' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useGetMyOrganizationQuery,
  useUpdateMyOrganizationMutation,
} = profileApi;
