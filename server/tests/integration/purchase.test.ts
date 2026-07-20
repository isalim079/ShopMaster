import request from 'supertest';
import { DocumentStatus, PaymentStatus } from '@prisma/client';

import app from '../../src/app';
import * as purchaseService from '../../src/modules/purchase/purchase.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/purchase/purchase.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: [
        'purchases:read',
        'purchases:write',
        'purchases:delete',
      ],
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

const mockedPurchaseService = purchaseService as jest.Mocked<
  typeof purchaseService
>;

const purchaseFixture = {
  id: 'po_1',
  organizationId: 'org_1',
  supplierId: 'sup_1',
  warehouseId: 'wh_1',
  number: 'PO-0001',
  status: DocumentStatus.DRAFT,
  paymentStatus: PaymentStatus.UNPAID,
  orderDate: new Date(),
  expectedDate: null,
  subtotal: 200,
  taxAmount: 0,
  discountAmount: 0,
  total: 200,
  paidAmount: 0,
  notes: null,
  createdById: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: 'poi_1',
      purchaseId: 'po_1',
      productId: 'prod_1',
      quantity: 10,
      receivedQty: 0,
      unitCost: 20,
      taxRate: 0,
      discount: 0,
      lineTotal: 200,
    },
  ],
};

describe('Purchases API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: [
          'purchases:read',
          'purchases:write',
          'purchases:delete',
        ],
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

  it('POST /api/v1/purchases creates purchase', async () => {
    mockedPurchaseService.createPurchase.mockResolvedValue(purchaseFixture);

    const response = await request(app)
      .post('/api/v1/purchases')
      .send({
        supplierId: 'sup_1',
        warehouseId: 'wh_1',
        items: [{ productId: 'prod_1', quantity: 10, unitCost: 20 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.number).toBe('PO-0001');
  });

  it('GET /api/v1/purchases lists purchases', async () => {
    mockedPurchaseService.getPurchases.mockResolvedValue({
      purchases: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/purchases');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('GET /api/v1/purchases/:id returns detail', async () => {
    mockedPurchaseService.getPurchaseById.mockResolvedValue(purchaseFixture);

    const response = await request(app).get('/api/v1/purchases/po_1');
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('po_1');
  });

  it('PATCH /api/v1/purchases/:id updates', async () => {
    mockedPurchaseService.updatePurchase.mockResolvedValue({
      ...purchaseFixture,
      notes: 'updated',
    });

    const response = await request(app)
      .patch('/api/v1/purchases/po_1')
      .send({ notes: 'updated' });

    expect(response.status).toBe(200);
    expect(response.body.data.notes).toBe('updated');
  });

  it('DELETE /api/v1/purchases/:id cancels', async () => {
    mockedPurchaseService.cancelPurchase.mockResolvedValue({
      message: 'Purchase cancelled successfully.',
    });

    const response = await request(app).delete('/api/v1/purchases/po_1');
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/cancelled/i);
  });

  it('POST /api/v1/purchases/:id/receive processes receipt', async () => {
    mockedPurchaseService.receivePurchase.mockResolvedValue({
      ...purchaseFixture,
      status: DocumentStatus.RECEIVED,
      items: [
        {
          ...purchaseFixture.items[0]!,
          receivedQty: 10,
        },
      ],
    });

    const response = await request(app)
      .post('/api/v1/purchases/po_1/receive')
      .send({ items: [{ purchaseItemId: 'poi_1', quantity: 10 }] });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(DocumentStatus.RECEIVED);
  });
});
