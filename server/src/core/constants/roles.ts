export const ROLE_SLUG = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type RoleSlug = (typeof ROLE_SLUG)[keyof typeof ROLE_SLUG];

/** Shop owner / admin may self-serve password reset & change. */
export const canSelfManagePassword = (roleSlug: string): boolean =>
  roleSlug === ROLE_SLUG.ADMIN || roleSlug === ROLE_SLUG.SUPER_ADMIN;

/** Roles an org admin may assign when adding team members. */
export const TEAM_ASSIGNABLE_ROLES = [
  ROLE_SLUG.MANAGER,
  ROLE_SLUG.EMPLOYEE,
] as const;

export type TeamAssignableRole =
  (typeof TEAM_ASSIGNABLE_ROLES)[number];

export const isTeamAssignableRole = (
  slug: string,
): slug is TeamAssignableRole =>
  (TEAM_ASSIGNABLE_ROLES as readonly string[]).includes(slug);

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
    description: 'Shop owner / administrative access',
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
