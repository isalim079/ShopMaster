import request from 'supertest';
import { CatalogStatus } from '@prisma/client';

import app from '../../src/app';
import * as warehouseService from '../../src/modules/warehouse/warehouse.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/warehouse/warehouse.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['warehouses:read', 'warehouses:write', 'warehouses:delete'],
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

const mockedWarehouseService =
  warehouseService as jest.Mocked<typeof warehouseService>;

describe('Warehouses API integration', () => {
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
          'warehouses:read',
          'warehouses:write',
          'warehouses:delete',
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

  it('POST /api/v1/warehouses creates warehouse', async () => {
    mockedWarehouseService.createWarehouse.mockResolvedValue({
      id: 'wh_1',
      organizationId: 'org_1',
      name: 'Main Store',
      code: 'MAIN',
      address: null,
      city: null,
      country: null,
      isDefault: true,
      status: CatalogStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .post('/api/v1/warehouses')
      .send({ name: 'Main Store', isDefault: true });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Main Store');
  });

  it('GET /api/v1/warehouses returns list', async () => {
    mockedWarehouseService.getWarehouses.mockResolvedValue({
      warehouses: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/warehouses');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});
