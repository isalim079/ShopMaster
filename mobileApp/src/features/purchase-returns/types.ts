import type { DocumentStatus } from '@/src/shared/types/enums';

export type PurchaseReturnItem = {
  id: string;
  purchaseReturnId: string;
  productId: string;
  productName?: string;
  purchaseItemId: string | null;
  quantity: number;
  unitCost: number;
  lineTotal: number;
};

export type PurchaseReturn = {
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
  returnDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseReturnDetail = PurchaseReturn & {
  items: PurchaseReturnItem[];
};

export type PurchaseReturnInput = {
  purchaseId: string;
  returnDate?: string;
  notes?: string;
  items: { purchaseItemId: string; quantity: number; unitCost?: number }[];
};
