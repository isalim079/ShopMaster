import { OrganizationSetting, ThemePreference } from '@prisma/client';

import type {
  OrganizationSettingResponse,
  UserSettingsResponse,
} from './setting.types';

export const toUserSettingsResponse = (
  theme: ThemePreference,
): UserSettingsResponse => ({
  theme,
});

export const toOrganizationSettingResponse = (
  setting: OrganizationSetting,
): OrganizationSettingResponse => ({
  id: setting.id,
  key: setting.key,
  value: setting.value,
  description: setting.description,
  updatedAt: setting.updatedAt,
});

export const toOrganizationSettingListResponse = (
  settings: OrganizationSetting[],
): OrganizationSettingResponse[] => {
  return settings.map(toOrganizationSettingResponse);
};
