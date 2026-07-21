import type { CatalogStatus } from '@/src/shared/types/enums';

export type Product = {
  id: string;
  organizationId: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  categoryId: string | null;
  brandId: string | null;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  taxRate: number;
  reorderLevel: number | null;
  imageUrl: string | null;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
};

export type StockByWarehouse = {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
};

export type ProductDetail = Product & {
  totalStock: number;
  stocks?: StockByWarehouse[];
};

export type ProductInput = {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  unit?: string;
  purchasePrice: number;
  salePrice: number;
  taxRate?: number;
  reorderLevel?: number;
  imageUrl?: string;
  status?: CatalogStatus;
  warehouseId?: string;
  openingStock?: number;
};

export type ProductUpdateInput = Partial<
  Omit<ProductInput, 'warehouseId' | 'openingStock'>
> & {
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  reorderLevel?: number | null;
  imageUrl?: string | null;
};
