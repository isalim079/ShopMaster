import { Permission } from '@prisma/client';

import type { PermissionResponse } from './permission.types';

export const toPermissionResponse = (
  permission: Permission,
): PermissionResponse => ({
  id: permission.id,
  name: permission.name,
  slug: permission.slug,
  module: permission.module,
  description: permission.description,
  isSystem: permission.isSystem,
  createdAt: permission.createdAt,
  updatedAt: permission.updatedAt,
});

export const toPermissionListResponse = (
  permissions: Permission[],
): PermissionResponse[] => {
  return permissions.map(toPermissionResponse);
};
