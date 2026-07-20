import request from 'supertest';
import { StockMovementType } from '@prisma/client';

import app from '../../src/app';
import * as inventoryService from '../../src/modules/inventory/inventory.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/inventory/inventory.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['inventory:read', 'inventory:write'],
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

const mockedInventoryService =
  inventoryService as jest.Mocked<typeof inventoryService>;

describe('Inventory API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['inventory:read', 'inventory:write'],
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

  it('GET /api/v1/inventory returns stocks list', async () => {
    mockedInventoryService.getStocks.mockResolvedValue({
      stocks: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/inventory');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('GET /api/v1/inventory/history returns movements', async () => {
    mockedInventoryService.getMovements.mockResolvedValue({
      movements: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/inventory/history');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('POST /api/v1/inventory/adjustment creates adjustment', async () => {
    mockedInventoryService.createAdjustment.mockResolvedValue({
      stock: { productId: 'prod_1', warehouseId: 'wh_1', quantity: 20 },
      movement: {
        id: 'mov_1',
        type: StockMovementType.ADJUSTMENT,
        quantity: 20,
        balanceAfter: 20,
      },
    });

    const response = await request(app)
      .post('/api/v1/inventory/adjustment')
      .send({ productId: 'prod_1', warehouseId: 'wh_1', quantity: 20 });

    expect(response.status).toBe(201);
    expect(response.body.data.stock.quantity).toBe(20);
  });

  it('GET /api/v1/inventory with filters', async () => {
    mockedInventoryService.getStocks.mockResolvedValue({
      stocks: [
        {
          id: 'stk_1',
          organizationId: 'org_1',
          productId: 'prod_1',
          productName: 'Widget',
          productSku: 'W-01',
          warehouseId: 'wh_1',
          warehouseName: 'Main',
          quantity: 50,
          reorderLevel: 10,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const response = await request(app)
      .get('/api/v1/inventory')
      .query({ warehouseId: 'wh_1', lowStock: 'false' });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('GET /api/v1/inventory/history with type filter', async () => {
    mockedInventoryService.getMovements.mockResolvedValue({
      movements: [
        {
          id: 'mov_1',
          organizationId: 'org_1',
          productId: 'prod_1',
          productName: 'Widget',
          warehouseId: 'wh_1',
          warehouseName: 'Main',
          type: StockMovementType.ADJUSTMENT,
          quantity: 5,
          balanceAfter: 50,
          unitCost: null,
          note: 'test adj',
          referenceType: null,
          referenceId: null,
          createdById: 'user_1',
          createdAt: new Date(),
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const response = await request(app)
      .get('/api/v1/inventory/history')
      .query({ type: 'ADJUSTMENT' });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].type).toBe('ADJUSTMENT');
  });
});
