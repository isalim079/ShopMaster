import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData } from '@/src/shared/api/unwrap';
import type { ApiSuccess } from '@/src/shared/api/types';

import type { UpdateUserSettingsInput, UserSettings } from '../types';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMySettings: build.query<UserSettings, void>({
      query: () => '/settings/me',
      transformResponse: (response: ApiSuccess<UserSettings>) =>
        unwrapData(response),
      providesTags: [{ type: 'Settings', id: 'ME' }],
    }),

    updateMySettings: build.mutation<UserSettings, UpdateUserSettingsInput>({
      query: (body) => ({
        url: '/settings/me',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiSuccess<UserSettings>) =>
        unwrapData(response),
      invalidatesTags: [{ type: 'Settings', id: 'ME' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMySettingsQuery, useUpdateMySettingsMutation } =
  settingsApi;
