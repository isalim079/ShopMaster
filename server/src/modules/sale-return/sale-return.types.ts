import { DocumentStatus } from '@prisma/client';

export interface SaleReturnItemResponse {
  id: string;
  saleReturnId: string;
  productId: string;
  productName?: string;
  saleItemId: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SaleReturnResponse {
  id: string;
  organizationId: string;
  saleId: string;
  saleNumber?: string;
  customerId: string | null;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  number: string;
  status: DocumentStatus;
  returnDate: Date;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleReturnDetailResponse extends SaleReturnResponse {
  items: SaleReturnItemResponse[];
}

export interface ListSaleReturnsFilters {
  search?: string;
  status?: DocumentStatus;
  saleId?: string;
  customerId?: string;
}

export interface ListSaleReturnsResult {
  saleReturns: SaleReturnResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
