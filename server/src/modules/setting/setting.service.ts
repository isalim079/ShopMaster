import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { SETTING_KEY, type SettingKey } from '../../core/constants/settings';
import * as repository from './setting.repository';
import {
  toOrganizationSettingListResponse,
  toOrganizationSettingResponse,
  toUserSettingsResponse,
} from './setting.mapper';
import type {
  UpdateUserSettingsInput,
  UpsertOrganizationSettingInput,
  UpsertOrganizationSettingsInput,
} from './setting.validation';

const isKnownSettingKey = (key: string): key is SettingKey => {
  return (Object.values(SETTING_KEY) as string[]).includes(key);
};

export const getMySettings = async (userId: string) => {
  const user = await repository.getUserTheme(userId);

  if (!user) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toUserSettingsResponse(user.theme);
};

export const updateMySettings = async (
  userId: string,
  payload: UpdateUserSettingsInput,
) => {
  const user = await repository.updateUserTheme(userId, payload.theme);
  return toUserSettingsResponse(user.theme);
};

export const getOrganizationSettings = async (organizationId: string) => {
  const settings =
    await repository.ensureDefaultOrganizationSettings(organizationId);

  return toOrganizationSettingListResponse(settings);
};

export const getOrganizationSettingByKey = async (
  organizationId: string,
  key: string,
) => {
  if (!isKnownSettingKey(key)) {
    throw new AppError('Unknown setting key.', HTTP_STATUS.BAD_REQUEST);
  }

  await repository.ensureDefaultOrganizationSettings(organizationId);

  const setting = await repository.findOrganizationSettingByKey(
    organizationId,
    key,
  );

  if (!setting) {
    throw new AppError('Setting not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toOrganizationSettingResponse(setting);
};

export const upsertOrganizationSetting = async (
  organizationId: string,
  key: string,
  payload: UpsertOrganizationSettingInput,
) => {
  if (!isKnownSettingKey(key)) {
    throw new AppError('Unknown setting key.', HTTP_STATUS.BAD_REQUEST);
  }

  const setting = await repository.upsertOrganizationSetting(
    organizationId,
    key,
    payload.value,
  );

  return toOrganizationSettingResponse(setting);
};

export const upsertOrganizationSettings = async (
  organizationId: string,
  payload: UpsertOrganizationSettingsInput,
) => {
  const settings = await repository.upsertOrganizationSettings(
    organizationId,
    payload.settings,
  );

  return toOrganizationSettingListResponse(settings);
};
