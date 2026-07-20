import { Role } from '@prisma/client';

import type { RoleResponse } from './role.types';

export const toRoleResponse = (role: Role): RoleResponse => ({
  id: role.id,
  name: role.name,
  slug: role.slug,
  description: role.description,
  isSystem: role.isSystem,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
});

export const toRoleListResponse = (roles: Role[]): RoleResponse[] => {
  return roles.map(toRoleResponse);
};
