import type { UserWithRole } from './auth.types';

export const toUserResponse = (user: UserWithRole) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: {
    id: user.role.id,
    name: user.role.name,
    slug: user.role.slug,
  },
  organization: {
    id: user.organization.id,
    name: user.organization.name,
    slug: user.organization.slug,
  },
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
