import request from 'supertest';
import { DocumentStatus, PaymentStatus } from '@prisma/client';

import app from '../../src/app';
import * as saleService from '../../src/modules/sale/sale.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/sale/sale.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['sales:read', 'sales:write', 'sales:delete'],
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

const mockedService = saleService as jest.Mocked<typeof saleService>;

const saleFixture = {
  id: 'sale_1',
  organizationId: 'org_1',
  customerId: null,
  warehouseId: 'wh_1',
  number: 'INV-0001',
  status: DocumentStatus.COMPLETED,
  paymentStatus: PaymentStatus.UNPAID,
  saleDate: new Date(),
  subtotal: 100,
  taxAmount: 0,
  discountAmount: 0,
  total: 100,
  paidAmount: 0,
  notes: null,
  createdById: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: 'si_1',
      saleId: 'sale_1',
      productId: 'prod_1',
      quantity: 2,
      unitPrice: 50,
      taxRate: 0,
      discount: 0,
      lineTotal: 100,
    },
  ],
};

describe('Sales API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['sales:read', 'sales:write', 'sales:delete'],
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

  it('POST /api/v1/sales creates sale', async () => {
    mockedService.createSale.mockResolvedValue(saleFixture);

    const response = await request(app)
      .post('/api/v1/sales')
      .send({
        warehouseId: 'wh_1',
        items: [{ productId: 'prod_1', quantity: 2, unitPrice: 50 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.number).toBe('INV-0001');
  });

  it('GET /api/v1/sales returns list', async () => {
    mockedService.getSales.mockResolvedValue({
      sales: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/sales');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('GET /api/v1/sales/:id returns detail', async () => {
    mockedService.getSaleById.mockResolvedValue(saleFixture);

    const response = await request(app).get('/api/v1/sales/sale_1');
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('sale_1');
  });

  it('PATCH /api/v1/sales/:id updates draft', async () => {
    mockedService.updateSale.mockResolvedValue({
      ...saleFixture,
      status: DocumentStatus.DRAFT,
      notes: 'updated',
    });

    const response = await request(app)
      .patch('/api/v1/sales/sale_1')
      .send({ notes: 'updated' });

    expect(response.status).toBe(200);
    expect(response.body.data.notes).toBe('updated');
  });

  it('POST /api/v1/sales/:id/complete completes draft', async () => {
    mockedService.completeSale.mockResolvedValue({
      ...saleFixture,
      status: DocumentStatus.COMPLETED,
    });

    const response = await request(app).post('/api/v1/sales/sale_1/complete');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(DocumentStatus.COMPLETED);
  });

  it('DELETE /api/v1/sales/:id cancels draft', async () => {
    mockedService.cancelSale.mockResolvedValue({
      message: 'Sale cancelled successfully.',
    });

    const response = await request(app).delete('/api/v1/sales/sale_1');
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/cancelled/i);
  });

  it('GET /api/v1/sales/:id/invoice returns invoice', async () => {
    mockedService.getSaleInvoice.mockResolvedValue({
      id: 'sale_1',
      organizationId: 'org_1',
      organizationName: 'ShopMaster',
      number: 'INV-0001',
      status: DocumentStatus.COMPLETED,
      paymentStatus: PaymentStatus.UNPAID,
      saleDate: new Date(),
      customer: null,
      warehouse: { id: 'wh_1', name: 'Main' },
      lines: [
        {
          productId: 'prod_1',
          productName: 'Widget',
          quantity: 2,
          unitPrice: 50,
          taxRate: 0,
          discount: 0,
          lineTotal: 100,
        },
      ],
      subtotal: 100,
      taxAmount: 0,
      discountAmount: 0,
      total: 100,
      paidAmount: 0,
      balanceDue: 100,
      notes: null,
      createdAt: new Date(),
    });

    const response = await request(app).get('/api/v1/sales/sale_1/invoice');
    expect(response.status).toBe(200);
    expect(response.body.data.balanceDue).toBe(100);
    expect(response.body.data.lines).toHaveLength(1);
  });
});
