import { CatalogStatus } from '@prisma/client';

export interface ProductResponse {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDetailResponse extends ProductResponse {
  totalStock: number;
  stocks?: StockByWarehouse[];
}

export interface StockByWarehouse {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
}

export interface ListProductsFilters {
  search?: string;
  status?: CatalogStatus;
  categoryId?: string;
  brandId?: string;
}

export interface ListProductsResult {
  products: ProductResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
