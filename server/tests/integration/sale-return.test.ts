import request from 'supertest';
import { DocumentStatus } from '@prisma/client';

import app from '../../src/app';
import * as saleReturnService from '../../src/modules/sale-return/sale-return.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/sale-return/sale-return.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: [
        'sale-returns:read',
        'sale-returns:write',
        'sale-returns:delete',
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

const mockedService = saleReturnService as jest.Mocked<
  typeof saleReturnService
>;

const returnFixture = {
  id: 'sr_1',
  organizationId: 'org_1',
  saleId: 'sale_1',
  customerId: 'cust_1',
  warehouseId: 'wh_1',
  number: 'SR-0001',
  status: DocumentStatus.COMPLETED,
  returnDate: new Date(),
  subtotal: 50,
  taxAmount: 0,
  total: 50,
  notes: null,
  createdById: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: 'sri_1',
      saleReturnId: 'sr_1',
      productId: 'prod_1',
      saleItemId: 'si_1',
      quantity: 1,
      unitPrice: 50,
      lineTotal: 50,
    },
  ],
};

describe('Sale Returns API integration', () => {
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
          'sale-returns:read',
          'sale-returns:write',
          'sale-returns:delete',
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

  it('POST /api/v1/sale-returns creates return', async () => {
    mockedService.createSaleReturn.mockResolvedValue(returnFixture);

    const response = await request(app)
      .post('/api/v1/sale-returns')
      .send({
        saleId: 'sale_1',
        items: [{ saleItemId: 'si_1', quantity: 1 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.number).toBe('SR-0001');
  });

  it('GET /api/v1/sale-returns returns list', async () => {
    mockedService.getSaleReturns.mockResolvedValue({
      saleReturns: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/sale-returns');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('GET /api/v1/sale-returns/:id returns detail', async () => {
    mockedService.getSaleReturnById.mockResolvedValue(returnFixture);

    const response = await request(app).get('/api/v1/sale-returns/sr_1');
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('sr_1');
  });
});
