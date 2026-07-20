import { Role } from '@prisma/client';

export interface RoleResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListRolesFilters {
  search?: string;
  isSystem?: boolean;
}

export interface ListRolesResult {
  roles: RoleResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type RoleEntity = Role;
