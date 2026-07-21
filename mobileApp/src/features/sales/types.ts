import type {
  DocumentStatus,
  PaymentStatus,
} from '@/src/shared/types/enums';

export type SaleItem = {
  id: string;
  saleId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  lineTotal: number;
};

export type Sale = {
  id: string;
  organizationId: string;
  customerId: string | null;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  number: string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  saleDate: string;
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

export type SaleDetail = Sale & { items: SaleItem[] };

export type SaleInvoice = {
  id: string;
  organizationId: string;
  organizationName?: string;
  number: string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  saleDate: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  warehouse: { id: string; name: string };
  lines: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount: number;
    lineTotal: number;
  }[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  notes: string | null;
  createdAt: string;
};

export type SaleItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
};

export type SaleInput = {
  warehouseId: string;
  customerId?: string;
  saleDate?: string;
  status?: 'DRAFT' | 'COMPLETED';
  discountAmount?: number;
  notes?: string;
  items: SaleItemInput[];
};

export type SaleUpdateInput = {
  customerId?: string | null;
  warehouseId?: string;
  saleDate?: string;
  discountAmount?: number;
  notes?: string | null;
  items?: SaleItemInput[];
};
