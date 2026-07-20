import { CatalogStatus } from '@prisma/client';

export interface BrandResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  status: CatalogStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListBrandsFilters {
  search?: string;
  status?: CatalogStatus;
}

export interface ListBrandsResult {
  brands: BrandResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
