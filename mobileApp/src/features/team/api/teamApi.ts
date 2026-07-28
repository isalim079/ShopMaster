import { baseApi } from '@/src/shared/api/baseApi';
import { unwrapData } from '@/src/shared/api/unwrap';
import type { ApiSuccess } from '@/src/shared/api/types';

import type { CreateTeamMemberInput, TeamMember } from '../types';

export const teamApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTeamMember: build.mutation<TeamMember, CreateTeamMemberInput>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<TeamMember>) =>
        unwrapData(response),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateTeamMemberMutation } = teamApi;
