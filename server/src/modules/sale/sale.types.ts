import { DocumentStatus, PaymentStatus } from '@prisma/client';

export interface SaleItemResponse {
  id: string;
  saleId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  lineTotal: number;
}

export interface SaleResponse {
  id: string;
  organizationId: string;
  customerId: string | null;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  number: string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  saleDate: Date;
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

export interface SaleDetailResponse extends SaleResponse {
  items: SaleItemResponse[];
}

export interface SaleInvoiceLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  lineTotal: number;
}

export interface SaleInvoiceResponse {
  id: string;
  organizationId: string;
  organizationName?: string;
  number: string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  saleDate: Date;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  warehouse: {
    id: string;
    name: string;
  };
  lines: SaleInvoiceLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  notes: string | null;
  createdAt: Date;
}

export interface ListSalesFilters {
  search?: string;
  status?: DocumentStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  warehouseId?: string;
}

export interface ListSalesResult {
  sales: SaleResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
