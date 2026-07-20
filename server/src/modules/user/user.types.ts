import { UserStatus } from '@prisma/client';

export interface UserRoleResponse {
  id: string;
  name: string;
  slug: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: UserRoleResponse;
  status: UserStatus;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListUsersFilters {
  search?: string;
  roleId?: string;
  roleSlug?: string;
  status?: UserStatus;
}

export interface ListUsersResult {
  users: UserResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
