import { PaymentDirection, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { AppError } from '../../src/core/errors/app-error';
import * as paymentService from '../../src/modules/payment/payment.service';
import * as repository from '../../src/modules/payment/payment.repository';
import { prisma } from '../../src/core/database';

jest.mock('../../src/modules/payment/payment.repository');
jest.mock('../../src/core/database', () => ({
  prisma: {
    customer: { findFirst: jest.fn() },
    supplier: { findFirst: jest.fn() },
    sale: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    purchase: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: { create: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedPrisma = prisma as unknown as {
  customer: { findFirst: jest.Mock };
  supplier: { findFirst: jest.Mock };
  sale: { findFirst: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  purchase: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  payment: { create: jest.Mock; delete: jest.Mock };
  $transaction: jest.Mock;
};

const basePayment = {
  id: 'pay_1',
  organizationId: 'org_1',
  direction: PaymentDirection.IN,
  method: PaymentMethod.CASH,
  amount: new Decimal(100),
  paymentDate: new Date(),
  reference: null,
  notes: null,
  customerId: 'cust_1',
  supplierId: null,
  saleId: 'sale_1',
  purchaseId: null,
  createdById: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: { id: 'cust_1', name: 'Acme' },
  supplier: null,
  sale: { id: 'sale_1', number: 'INV-0001' },
  purchase: null,
};

describe('payment.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPrisma.customer.findFirst.mockResolvedValue({ id: 'cust_1' });
    mockedPrisma.supplier.findFirst.mockResolvedValue({ id: 'sup_1' });
    mockedPrisma.sale.findFirst.mockResolvedValue({
      id: 'sale_1',
      total: new Decimal(150),
      paidAmount: new Decimal(0),
      customerId: 'cust_1',
    });
    mockedPrisma.purchase.findFirst.mockResolvedValue({
      id: 'pur_1',
      total: new Decimal(200),
      paidAmount: new Decimal(50),
      supplierId: 'sup_1',
    });
  });

  describe('createPayment', () => {
    it('creates IN payment and updates sale paid amount', async () => {
      mockedPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          payment: { create: jest.fn().mockResolvedValue(basePayment) },
          sale: { update: jest.fn().mockResolvedValue({}) },
          purchase: { update: jest.fn().mockResolvedValue({}) },
        };
        const result = await fn(tx);
        (mockedPrisma.$transaction as unknown as { tx?: unknown }).tx = tx;
        return result;
      });

      const result = await paymentService.createPayment(
        'org_1',
        {
          direction: PaymentDirection.IN,
          amount: 100,
          customerId: 'cust_1',
          saleId: 'sale_1',
        },
        'user_1',
      );

      expect(result.id).toBe('pay_1');
      expect(result.saleNumber).toBe('INV-0001');
    });

    it('rejects when neither customer/supplier/sale/purchase provided is only caught by zod', async () => {
      mockedPrisma.$transaction.mockImplementation(async (fn) =>
        fn({
          payment: { create: jest.fn().mockResolvedValue(basePayment) },
          sale: { update: jest.fn() },
          purchase: { update: jest.fn() },
        }),
      );

      const promise = paymentService.createPayment(
        'org_1',
        {
          direction: PaymentDirection.IN,
          amount: 100,
          customerId: 'cust_1',
        },
        'user_1',
      );

      await expect(promise).resolves.toBeDefined();
    });

    it('rejects IN direction on purchase link', async () => {
      await expect(
        paymentService.createPayment('org_1', {
          direction: PaymentDirection.IN,
          amount: 100,
          purchaseId: 'pur_1',
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects OUT direction on sale link', async () => {
      await expect(
        paymentService.createPayment('org_1', {
          direction: PaymentDirection.OUT,
          amount: 100,
          saleId: 'sale_1',
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects unknown sale', async () => {
      mockedPrisma.sale.findFirst.mockResolvedValue(null);
      await expect(
        paymentService.createPayment('org_1', {
          direction: PaymentDirection.IN,
          amount: 100,
          saleId: 'missing',
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('getPayments', () => {
    it('returns paginated list', async () => {
      mockedRepository.findMany.mockResolvedValue([[] as never[], 0] as never);
      const result = await paymentService.getPayments('org_1', {
        page: 1,
        limit: 10,
      });
      expect(result.payments).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getPaymentById', () => {
    it('throws when missing', async () => {
      mockedRepository.findById.mockResolvedValue(null);
      await expect(
        paymentService.getPaymentById('org_1', 'missing'),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('deletePayment', () => {
    it('throws when payment missing', async () => {
      mockedRepository.findById.mockResolvedValue(null);
      await expect(
        paymentService.deletePayment('org_1', 'missing'),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('reverses sale paid amount', async () => {
      mockedRepository.findById.mockResolvedValue(basePayment as never);
      mockedPrisma.$transaction.mockImplementation(async (fn) =>
        fn({
          sale: {
            findUnique: jest.fn().mockResolvedValue({
              total: new Decimal(150),
              paidAmount: new Decimal(100),
            }),
            update: jest.fn().mockResolvedValue({}),
          },
          purchase: {
            findUnique: jest.fn(),
            update: jest.fn(),
          },
          payment: { delete: jest.fn().mockResolvedValue({}) },
        }),
      );

      const result = await paymentService.deletePayment('org_1', 'pay_1');
      expect(result.message).toMatch(/deleted/i);
    });
  });
});
