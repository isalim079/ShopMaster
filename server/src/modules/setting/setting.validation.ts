import { z } from 'zod';
import { ThemePreference } from '@prisma/client';

import { SETTING_KEY } from '../../core/constants/settings';

const settingKeyValues = Object.values(SETTING_KEY) as [string, ...string[]];

export const updateUserSettingsSchema = z.object({
  body: z.object({
    theme: z.nativeEnum(ThemePreference),
  }),
});

export const settingKeyParamSchema = z.object({
  params: z.object({
    key: z.enum(settingKeyValues),
  }),
});

export const upsertOrganizationSettingSchema = z.object({
  params: z.object({
    key: z.enum(settingKeyValues),
  }),
  body: z.object({
    value: z.string().trim().min(1).max(255),
  }),
});

export const upsertOrganizationSettingsSchema = z.object({
  body: z.object({
    settings: z
      .array(
        z.object({
          key: z.enum(settingKeyValues),
          value: z.string().trim().min(1).max(255),
        }),
      )
      .min(1),
  }),
});

export type UpdateUserSettingsInput = z.infer<
  typeof updateUserSettingsSchema
>['body'];

export type UpsertOrganizationSettingInput = z.infer<
  typeof upsertOrganizationSettingSchema
>['body'];

export type UpsertOrganizationSettingsInput = z.infer<
  typeof upsertOrganizationSettingsSchema
>['body'];
