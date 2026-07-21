import type { DocumentStatus } from '@/src/shared/types/enums';

export type SaleReturnItem = {
  id: string;
  saleReturnId: string;
  productId: string;
  productName?: string;
  saleItemId: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type SaleReturn = {
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
  returnDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SaleReturnDetail = SaleReturn & { items: SaleReturnItem[] };

export type SaleReturnInput = {
  saleId: string;
  returnDate?: string;
  notes?: string;
  items: { saleItemId: string; quantity: number; unitPrice?: number }[];
};
