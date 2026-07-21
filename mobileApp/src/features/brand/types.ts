export type CatalogStatus = 'ACTIVE' | 'INACTIVE';

export type Brand = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
};

export type BrandInput = {
  name: string;
  description?: string;
  status?: CatalogStatus;
};
