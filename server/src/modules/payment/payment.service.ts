import {
  PaymentDirection,
  PaymentStatus,
  Prisma,
} from '@prisma/client';

import * as repository from './payment.repository';
import {
  toPaymentListResponse,
  toPaymentResponse,
} from './payment.mapper';
import type {
  CreatePaymentInput,
  ListPaymentsQuery,
} from './payment.validation';
import type {
  ListPaymentsResult,
  PaymentResponse,
} from './payment.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { prisma } from '../../core/database';
import { decimalToNumber } from '../product/product.mapper';

const derivePaymentStatus = (
  total: number,
  paidAmount: number,
): PaymentStatus => {
  if (paidAmount <= 0) return PaymentStatus.UNPAID;
  if (paidAmount + 0.0001 < total) return PaymentStatus.PARTIAL;
  return PaymentStatus.PAID;
};

const validateReferences = async (
  organizationId: string,
  payload: CreatePaymentInput,
): Promise<{
  saleTotal: number;
  salePaid: number;
  purchaseTotal: number;
  purchasePaid: number;
}> => {
  let saleTotal = 0;
  let salePaid = 0;
  let purchaseTotal = 0;
  let purchasePaid = 0;

  if (payload.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: payload.customerId, organizationId },
      select: { id: true },
    });
    if (!customer) {
      throw new AppError(
        'Customer not found in this organization.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  if (payload.supplierId) {
    const supplier = await prisma.supplier.findFirst({
      where: { id: payload.supplierId, organizationId },
      select: { id: true },
    });
    if (!supplier) {
      throw new AppError(
        'Supplier not found in this organization.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  if (payload.saleId) {
    const sale = await prisma.sale.findFirst({
      where: { id: payload.saleId, organizationId },
      select: { id: true, total: true, paidAmount: true, customerId: true },
    });
    if (!sale) {
      throw new AppError(
        'Sale not found in this organization.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (payload.direction !== PaymentDirection.IN) {
      throw new AppError(
        'Payments linked to a sale must have direction IN.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    saleTotal = decimalToNumber(sale.total);
    salePaid = decimalToNumber(sale.paidAmount);
  }

  if (payload.purchaseId) {
    const purchase = await prisma.purchase.findFirst({
      where: { id: payload.purchaseId, organizationId },
      select: { id: true, total: true, paidAmount: true, supplierId: true },
    });
    if (!purchase) {
      throw new AppError(
        'Purchase not found in this organization.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (payload.direction !== PaymentDirection.OUT) {
      throw new AppError(
        'Payments linked to a purchase must have direction OUT.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    purchaseTotal = decimalToNumber(purchase.total);
    purchasePaid = decimalToNumber(purchase.paidAmount);
  }

  return { saleTotal, salePaid, purchaseTotal, purchasePaid };
};

export const createPayment = async (
  organizationId: string,
  payload: CreatePaymentInput,
  createdById?: string,
): Promise<PaymentResponse> => {
  const { saleTotal, salePaid, purchaseTotal, purchasePaid } =
    await validateReferences(organizationId, payload);

  const created = await prisma.$transaction(async (tx) => {
    const data: Prisma.PaymentUncheckedCreateInput = {
      organizationId,
      direction: payload.direction,
      method: payload.method ?? 'CASH',
      amount: payload.amount,
      reference: payload.reference ?? null,
      notes: payload.notes ?? null,
      customerId: payload.customerId ?? null,
      supplierId: payload.supplierId ?? null,
      saleId: payload.saleId ?? null,
      purchaseId: payload.purchaseId ?? null,
    };

    if (payload.paymentDate) data.paymentDate = payload.paymentDate;
    if (createdById) data.createdById = createdById;

    const payment = await tx.payment.create({
      data,
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        sale: { select: { id: true, number: true } },
        purchase: { select: { id: true, number: true } },
      },
    });

    if (payload.saleId) {
      const newPaid = salePaid + payload.amount;
      await tx.sale.update({
        where: { id: payload.saleId },
        data: {
          paidAmount: newPaid,
          paymentStatus: derivePaymentStatus(saleTotal, newPaid),
        },
      });
    }

    if (payload.purchaseId) {
      const newPaid = purchasePaid + payload.amount;
      await tx.purchase.update({
        where: { id: payload.purchaseId },
        data: {
          paidAmount: newPaid,
          paymentStatus: derivePaymentStatus(purchaseTotal, newPaid),
        },
      });
    }

    return payment;
  });

  return toPaymentResponse(created);
};

export const getPayments = async (
  organizationId: string,
  query: ListPaymentsQuery,
): Promise<ListPaymentsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    direction?: NonNullable<ListPaymentsQuery['direction']>;
    method?: NonNullable<ListPaymentsQuery['method']>;
    customerId?: string;
    supplierId?: string;
    saleId?: string;
    purchaseId?: string;
    from?: Date;
    to?: Date;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.direction) filters.direction = query.direction;
  if (query.method) filters.method = query.method;
  if (query.customerId) filters.customerId = query.customerId;
  if (query.supplierId) filters.supplierId = query.supplierId;
  if (query.saleId) filters.saleId = query.saleId;
  if (query.purchaseId) filters.purchaseId = query.purchaseId;
  if (query.from) filters.from = query.from;
  if (query.to) filters.to = query.to;

  const [rows, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    payments: toPaymentListResponse(rows),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getPaymentById = async (
  organizationId: string,
  id: string,
): Promise<PaymentResponse> => {
  const payment = await repository.findById(organizationId, id);
  if (!payment) {
    throw new AppError('Payment not found.', HTTP_STATUS.NOT_FOUND);
  }
  return toPaymentResponse(payment);
};

export const deletePayment = async (
  organizationId: string,
  id: string,
): Promise<{ message: string }> => {
  const payment = await repository.findById(organizationId, id);
  if (!payment) {
    throw new AppError('Payment not found.', HTTP_STATUS.NOT_FOUND);
  }

  const amount = decimalToNumber(payment.amount);

  await prisma.$transaction(async (tx) => {
    if (payment.saleId) {
      const sale = await tx.sale.findUnique({
        where: { id: payment.saleId },
        select: { total: true, paidAmount: true },
      });
      if (sale) {
        const newPaid = Math.max(0, decimalToNumber(sale.paidAmount) - amount);
        await tx.sale.update({
          where: { id: payment.saleId },
          data: {
            paidAmount: newPaid,
            paymentStatus: derivePaymentStatus(
              decimalToNumber(sale.total),
              newPaid,
            ),
          },
        });
      }
    }

    if (payment.purchaseId) {
      const purchase = await tx.purchase.findUnique({
        where: { id: payment.purchaseId },
        select: { total: true, paidAmount: true },
      });
      if (purchase) {
        const newPaid = Math.max(
          0,
          decimalToNumber(purchase.paidAmount) - amount,
        );
        await tx.purchase.update({
          where: { id: payment.purchaseId },
          data: {
            paidAmount: newPaid,
            paymentStatus: derivePaymentStatus(
              decimalToNumber(purchase.total),
              newPaid,
            ),
          },
        });
      }
    }

    await tx.payment.delete({ where: { id } });
  });

  return { message: 'Payment deleted successfully.' };
};
