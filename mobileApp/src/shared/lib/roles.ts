export const ROLE_SLUG = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type RoleSlug = (typeof ROLE_SLUG)[keyof typeof ROLE_SLUG];

export const canSelfManagePassword = (roleSlug?: string | null): boolean =>
  roleSlug === ROLE_SLUG.ADMIN || roleSlug === ROLE_SLUG.SUPER_ADMIN;

export const isShopAdmin = (roleSlug?: string | null): boolean =>
  roleSlug === ROLE_SLUG.ADMIN || roleSlug === ROLE_SLUG.SUPER_ADMIN;

export const isStaffRole = (roleSlug?: string | null): boolean =>
  roleSlug === ROLE_SLUG.MANAGER || roleSlug === ROLE_SLUG.EMPLOYEE;

export function staffLoginToastMessage(roleName?: string | null): string {
  const label = roleName?.trim() || 'team member';
  return `Signed in as ${label}. Password changes and resets are managed by your shop admin.`;
}
