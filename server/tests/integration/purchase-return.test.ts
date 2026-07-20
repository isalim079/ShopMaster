import request from 'supertest';
import { DocumentStatus } from '@prisma/client';

import app from '../../src/app';
import * as purchaseReturnService from '../../src/modules/purchase-return/purchase-return.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/purchase-return/purchase-return.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: [
        'purchase-returns:read',
        'purchase-returns:write',
        'purchase-returns:delete',
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

const mockedService = purchaseReturnService as jest.Mocked<
  typeof purchaseReturnService
>;

const returnFixture = {
  id: 'pr_1',
  organizationId: 'org_1',
  purchaseId: 'po_1',
  supplierId: 'sup_1',
  warehouseId: 'wh_1',
  number: 'PR-0001',
  status: DocumentStatus.COMPLETED,
  returnDate: new Date(),
  subtotal: 20,
  taxAmount: 0,
  total: 20,
  notes: null,
  createdById: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: 'pri_1',
      purchaseReturnId: 'pr_1',
      productId: 'prod_1',
      purchaseItemId: 'poi_1',
      quantity: 1,
      unitCost: 20,
      lineTotal: 20,
    },
  ],
};

describe('Purchase Returns API integration', () => {
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
          'purchase-returns:read',
          'purchase-returns:write',
          'purchase-returns:delete',
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

  it('POST /api/v1/purchase-returns creates return', async () => {
    mockedService.createPurchaseReturn.mockResolvedValue(returnFixture);

    const response = await request(app)
      .post('/api/v1/purchase-returns')
      .send({
        purchaseId: 'po_1',
        items: [{ purchaseItemId: 'poi_1', quantity: 1 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.number).toBe('PR-0001');
  });

  it('GET /api/v1/purchase-returns returns list', async () => {
    mockedService.getPurchaseReturns.mockResolvedValue({
      purchaseReturns: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/purchase-returns');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('GET /api/v1/purchase-returns/:id returns detail', async () => {
    mockedService.getPurchaseReturnById.mockResolvedValue(returnFixture);

    const response = await request(app).get('/api/v1/purchase-returns/pr_1');
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('pr_1');
  });
});
