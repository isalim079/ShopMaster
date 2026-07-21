import type {
  PaymentDirection,
  PaymentMethod,
} from '@/src/shared/types/enums';

export type Payment = {
  id: string;
  organizationId: string;
  direction: PaymentDirection;
  method: PaymentMethod;
  amount: number;
  paymentDate: string;
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
  createdAt: string;
  updatedAt: string;
};

export type PaymentInput = {
  direction: PaymentDirection;
  method?: PaymentMethod;
  amount: number;
  paymentDate?: string;
  reference?: string;
  notes?: string;
  customerId?: string;
  supplierId?: string;
  saleId?: string;
  purchaseId?: string;
};
