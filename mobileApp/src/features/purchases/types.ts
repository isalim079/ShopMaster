import type { DocumentStatus, PaymentStatus } from '@/src/shared/types/enums';

export type PurchaseItem = {
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
};

export type Purchase = {
  id: string;
  organizationId: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  number: string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  expectedDate: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  notes: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseDetail = Purchase & { items: PurchaseItem[] };

export type PurchaseItemInput = {
  productId: string;
  quantity: number;
  unitCost: number;
  taxRate?: number;
  discount?: number;
};

export type PurchaseInput = {
  supplierId: string;
  warehouseId: string;
  orderDate?: string;
  expectedDate?: string;
  status?: 'DRAFT' | 'ORDERED';
  discountAmount?: number;
  notes?: string;
  items: PurchaseItemInput[];
};

export type ReceivePurchaseInput = {
  items: { purchaseItemId: string; quantity: number }[];
};
