import request from 'supertest';
import { PaymentDirection, PaymentMethod } from '@prisma/client';

import app from '../../src/app';
import * as paymentService from '../../src/modules/payment/payment.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/payment/payment.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['payments:read', 'payments:write', 'payments:delete'],
    };
    next();
  }),
  authorize: jest.fn(
    () => (_req: unknown, _res: unknown, next: () => void) => next(),
  ),
  requirePermission: jest.fn(
    () => (_req: unknown, _res: unknown, next: () => void) => next(),
  ),
}));

const mockedService = paymentService as jest.Mocked<typeof paymentService>;

const paymentFixture = {
  id: 'pay_1',
  organizationId: 'org_1',
  direction: PaymentDirection.IN,
  method: PaymentMethod.CASH,
  amount: 100,
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
};

describe('Payments API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['payments:read', 'payments:write', 'payments:delete'],
      };
      next();
    });
    (authorize as jest.Mock).mockImplementation(
      () => (_req: unknown, _res: unknown, next: () => void) => next(),
    );
    (requirePermission as jest.Mock).mockImplementation(
      () => (_req: unknown, _res: unknown, next: () => void) => next(),
    );
  });

  it('POST /api/v1/payments creates payment', async () => {
    mockedService.createPayment.mockResolvedValue(paymentFixture);

    const response = await request(app).post('/api/v1/payments').send({
      direction: PaymentDirection.IN,
      amount: 100,
      customerId: 'cust_1',
      saleId: 'sale_1',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.amount).toBe(100);
  });

  it('GET /api/v1/payments returns list', async () => {
    mockedService.getPayments.mockResolvedValue({
      payments: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/payments');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('GET /api/v1/payments/:id returns detail', async () => {
    mockedService.getPaymentById.mockResolvedValue(paymentFixture);

    const response = await request(app).get('/api/v1/payments/pay_1');
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('pay_1');
  });

  it('DELETE /api/v1/payments/:id removes payment', async () => {
    mockedService.deletePayment.mockResolvedValue({
      message: 'Payment deleted successfully.',
    });

    const response = await request(app).delete('/api/v1/payments/pay_1');
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/deleted/i);
  });
});
