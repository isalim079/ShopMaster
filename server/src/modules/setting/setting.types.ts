import { ThemePreference } from '@prisma/client';

export interface UserSettingsResponse {
  theme: ThemePreference;
}

export interface OrganizationSettingResponse {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: Date;
}

export interface OrganizationSettingsMap {
  [key: string]: string;
}
