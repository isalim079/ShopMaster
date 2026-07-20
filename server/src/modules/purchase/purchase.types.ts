import { DocumentStatus, PaymentStatus } from '@prisma/client';

export interface PurchaseItemResponse {
  id: string;
  purchaseId: string;
  productId: string;
  productName?: string;
  quantity: number;
  receivedQty: number;
  unitCost: number;
  taxRate: number;
  discount: number;
  lineTotal: number;
}

export interface PurchaseResponse {
  id: string;
  organizationId: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  number: string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  orderDate: Date;
  expectedDate: Date | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  notes: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseDetailResponse extends PurchaseResponse {
  items: PurchaseItemResponse[];
}

export interface ListPurchasesFilters {
  search?: string;
  status?: DocumentStatus;
  supplierId?: string;
  warehouseId?: string;
}

export interface ListPurchasesResult {
  purchases: PurchaseResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
