export const ROLE_SLUG = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type RoleSlug = (typeof ROLE_SLUG)[keyof typeof ROLE_SLUG];

export const SYSTEM_ROLES = [
  {
    name: 'Super Admin',
    slug: ROLE_SLUG.SUPER_ADMIN,
    description: 'Full system access',
    isSystem: true,
  },
  {
    name: 'Admin',
    slug: ROLE_SLUG.ADMIN,
    description: 'Administrative access',
    isSystem: true,
  },
  {
    name: 'Manager',
    slug: ROLE_SLUG.MANAGER,
    description: 'Operational management access',
    isSystem: true,
  },
  {
    name: 'Employee',
    slug: ROLE_SLUG.EMPLOYEE,
    description: 'Standard employee access',
    isSystem: true,
  },
] as const;
