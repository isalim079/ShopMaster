import { CatalogStatus } from '@prisma/client';

export interface WarehouseResponse {
  id: string;
  organizationId: string;
  name: string;
  code: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  isDefault: boolean;
  status: CatalogStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListWarehousesFilters {
  search?: string;
  status?: CatalogStatus;
}

export interface ListWarehousesResult {
  warehouses: WarehouseResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
