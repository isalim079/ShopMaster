import { CatalogStatus } from '@prisma/client';

export interface CategoryResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  parentId: string | null;
  status: CatalogStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListCategoriesFilters {
  search?: string;
  status?: CatalogStatus;
}

export interface ListCategoriesResult {
  categories: CategoryResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
