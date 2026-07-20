import { Role, User } from '@prisma/client';

import type { UserResponse } from './user.types';

type UserWithRole = User & { role: Role };

export const toUserResponse = (user: UserWithRole): UserResponse => ({
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
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const toUserListResponse = (users: UserWithRole[]): UserResponse[] => {
  return users.map(toUserResponse);
};
