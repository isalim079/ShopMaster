import { PaymentDirection, PaymentMethod } from '@prisma/client';

export interface PaymentResponse {
  id: string;
  organizationId: string;
  direction: PaymentDirection;
  method: PaymentMethod;
  amount: number;
  paymentDate: Date;
  reference: string | null;
  notes: string | null;
  customerId: string | null;
  customerName?: string;
  supplierId: string | null;
  supplierName?: string;
  saleId: string | null;
  saleNumber?: string;
  purchaseId: string | null;
  purchaseNumber?: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListPaymentsFilters {
  search?: string;
  direction?: PaymentDirection;
  method?: PaymentMethod;
  customerId?: string;
  supplierId?: string;
  saleId?: string;
  purchaseId?: string;
  from?: Date;
  to?: Date;
}

export interface ListPaymentsResult {
  payments: PaymentResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
