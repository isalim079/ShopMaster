import request from 'supertest';

import app from '../../src/app';
import * as paymentService from '../../src/modules/payment/payment.service';
import * as dashboardService from '../../src/modules/dashboard/dashboard.service';
import * as reportService from '../../src/modules/report/report.service';
import * as notificationService from '../../src/modules/notification/notification.service';
import * as auditService from '../../src/modules/audit/audit.service';
import * as uploadService from '../../src/modules/upload/upload.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';
import { PaymentDirection, PaymentMethod } from '@prisma/client';

jest.mock('../../src/modules/payment/payment.service');
jest.mock('../../src/modules/dashboard/dashboard.service');
jest.mock('../../src/modules/report/report.service');
jest.mock('../../src/modules/notification/notification.service');
jest.mock('../../src/modules/audit/audit.service');
jest.mock('../../src/modules/upload/upload.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['*'],
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

const mockedPayment = paymentService as jest.Mocked<typeof paymentService>;
const mockedDashboard =
  dashboardService as jest.Mocked<typeof dashboardService>;
const mockedReport = reportService as jest.Mocked<typeof reportService>;
const mockedNotification =
  notificationService as jest.Mocked<typeof notificationService>;
const mockedAudit = auditService as jest.Mocked<typeof auditService>;
const mockedUpload = uploadService as jest.Mocked<typeof uploadService>;

describe('Finance ops API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['*'],
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

  it('GET /api/v1/payments returns list', async () => {
    mockedPayment.getPayments.mockResolvedValue({
      payments: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/payments');
    expect(response.status).toBe(200);
  });

  it('POST /api/v1/payments creates payment', async () => {
    mockedPayment.createPayment.mockResolvedValue({
      id: 'pay_1',
      organizationId: 'org_1',
      direction: PaymentDirection.IN,
      method: PaymentMethod.CASH,
      amount: 100,
      paymentDate: new Date(),
      reference: null,
      notes: null,
      customerId: null,
      supplierId: null,
      saleId: null,
      purchaseId: null,
      createdById: 'user_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        direction: 'IN',
        amount: 100,
        method: 'CASH',
        customerId: 'cust_1',
      });

    expect(response.status).toBe(201);
  });

  it('GET /api/v1/dashboard/summary returns data', async () => {
    mockedDashboard.getSummary.mockResolvedValue({
      salesToday: { count: 0, total: 0 },
      purchasesToday: { count: 0, total: 0 },
      expensesToday: { count: 0, total: 0 },
      stockValue: 0,
      lowStockCount: 0,
      unpaidSales: 0,
      unpaidPurchases: 0,
    });

    const response = await request(app).get('/api/v1/dashboard/summary');
    expect(response.status).toBe(200);
  });

  it('GET /api/v1/reports/profit-loss returns data', async () => {
    mockedReport.profitLoss.mockResolvedValue({
      from: '1970-01-01',
      to: '2026-07-20',
      revenue: 0,
      purchases: 0,
      expenses: 0,
      grossProfit: 0,
      netProfit: 0,
    });

    const response = await request(app).get('/api/v1/reports/profit-loss');
    expect(response.status).toBe(200);
  });

  it('GET /api/v1/notifications returns list', async () => {
    mockedNotification.getNotifications.mockResolvedValue({
      notifications: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/notifications');
    expect(response.status).toBe(200);
  });

  it('GET /api/v1/audit-logs returns list', async () => {
    mockedAudit.getAuditLogs.mockResolvedValue({
      logs: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/audit-logs');
    expect(response.status).toBe(200);
  });

  it('GET /api/v1/uploads returns list', async () => {
    mockedUpload.getUploads.mockResolvedValue({
      uploads: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/uploads');
    expect(response.status).toBe(200);
  });
});
