import { Permission } from '@prisma/client';

export interface PermissionResponse {
  id: string;
  name: string;
  slug: string;
  module: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListPermissionsFilters {
  search?: string;
  module?: string;
  isSystem?: boolean;
}

export interface ListPermissionsResult {
  permissions: PermissionResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type PermissionEntity = Permission;
