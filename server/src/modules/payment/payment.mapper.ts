import type { Payment } from '@prisma/client';

import { decimalToNumber } from '../product/product.mapper';
import type { PaymentResponse } from './payment.types';

type PaymentWithRelations = Payment & {
  customer?: { name: string } | null;
  supplier?: { name: string } | null;
  sale?: { number: string } | null;
  purchase?: { number: string } | null;
};

export const toPaymentResponse = (
  payment: PaymentWithRelations,
): PaymentResponse => {
  const response: PaymentResponse = {
    id: payment.id,
    organizationId: payment.organizationId,
    direction: payment.direction,
    method: payment.method,
    amount: decimalToNumber(payment.amount),
    paymentDate: payment.paymentDate,
    reference: payment.reference,
    notes: payment.notes,
    customerId: payment.customerId,
    supplierId: payment.supplierId,
    saleId: payment.saleId,
    purchaseId: payment.purchaseId,
    createdById: payment.createdById,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };

  if (payment.customer?.name) response.customerName = payment.customer.name;
  if (payment.supplier?.name) response.supplierName = payment.supplier.name;
  if (payment.sale?.number) response.saleNumber = payment.sale.number;
  if (payment.purchase?.number) response.purchaseNumber = payment.purchase.number;

  return response;
};

export const toPaymentListResponse = (
  payments: PaymentWithRelations[],
): PaymentResponse[] => payments.map(toPaymentResponse);
