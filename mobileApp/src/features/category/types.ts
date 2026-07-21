export type CatalogStatus = 'ACTIVE' | 'INACTIVE';

export type Category = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  parentId: string | null;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
};

export type CategoryInput = {
  name: string;
  description?: string;
  parentId?: string;
  status?: CatalogStatus;
};
