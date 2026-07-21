export type CatalogStatus = 'ACTIVE' | 'INACTIVE';

export type Warehouse = {
  id: string;
  organizationId: string;
  name: string;
  code: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  isDefault: boolean;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
};

export type WarehouseInput = {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  isDefault?: boolean;
  status?: CatalogStatus;
};
