import { DocumentStatus } from '@prisma/client';

export interface PurchaseReturnItemResponse {
  id: string;
  purchaseReturnId: string;
  productId: string;
  productName?: string;
  purchaseItemId: string | null;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseReturnResponse {
  id: string;
  organizationId: string;
  purchaseId: string;
  purchaseNumber?: string;
  supplierId: string;
  supplierName?: string;
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

export interface PurchaseReturnDetailResponse extends PurchaseReturnResponse {
  items: PurchaseReturnItemResponse[];
}

export interface ListPurchaseReturnsFilters {
  search?: string;
  status?: DocumentStatus;
  purchaseId?: string;
  supplierId?: string;
}

export interface ListPurchaseReturnsResult {
  purchaseReturns: PurchaseReturnResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
