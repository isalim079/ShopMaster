import { ThemePreference } from '@prisma/client';

import { prisma } from '../../core/database';
import { getDefaultOrganizationSettings } from '../../core/constants/settings';

export const getUserTheme = (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { theme: true },
  });
};

export const updateUserTheme = (userId: string, theme: ThemePreference) => {
  return prisma.user.update({
    where: { id: userId },
    data: { theme },
    select: { theme: true },
  });
};

export const findOrganizationSettings = (organizationId: string) => {
  return prisma.organizationSetting.findMany({
    where: { organizationId },
    orderBy: { key: 'asc' },
  });
};

export const findOrganizationSettingByKey = (
  organizationId: string,
  key: string,
) => {
  return prisma.organizationSetting.findUnique({
    where: {
      organizationId_key: {
        organizationId,
        key,
      },
    },
  });
};

export const upsertOrganizationSetting = (
  organizationId: string,
  key: string,
  value: string,
  description?: string | null,
) => {
  return prisma.organizationSetting.upsert({
    where: {
      organizationId_key: {
        organizationId,
        key,
      },
    },
    update: {
      value,
      ...(description !== undefined ? { description } : {}),
    },
    create: {
      organizationId,
      key,
      value,
      description: description ?? null,
    },
  });
};

export const upsertOrganizationSettings = async (
  organizationId: string,
  settings: Array<{ key: string; value: string; description?: string }>,
) => {
  await prisma.$transaction(
    settings.map((setting) =>
      prisma.organizationSetting.upsert({
        where: {
          organizationId_key: {
            organizationId,
            key: setting.key,
          },
        },
        update: {
          value: setting.value,
          ...(setting.description !== undefined
            ? { description: setting.description }
            : {}),
        },
        create: {
          organizationId,
          key: setting.key,
          value: setting.value,
          description: setting.description ?? null,
        },
      }),
    ),
  );

  return findOrganizationSettings(organizationId);
};

export const ensureDefaultOrganizationSettings = async (
  organizationId: string,
) => {
  const defaults = getDefaultOrganizationSettings();
  const existing = await findOrganizationSettings(organizationId);
  const existingKeys = new Set(existing.map((item) => item.key));

  const missing = defaults.filter((item) => !existingKeys.has(item.key));

  if (missing.length > 0) {
    await prisma.organizationSetting.createMany({
      data: missing.map((item) => ({
        organizationId,
        key: item.key,
        value: item.value,
        description: item.description,
      })),
      skipDuplicates: true,
    });
  }

  return findOrganizationSettings(organizationId);
};
