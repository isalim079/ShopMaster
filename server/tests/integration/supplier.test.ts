import request from 'supertest';
import { PartyStatus } from '@prisma/client';

import app from '../../src/app';
import * as supplierService from '../../src/modules/supplier/supplier.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/supplier/supplier.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['suppliers:read', 'suppliers:write', 'suppliers:delete'],
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

const mockedSupplierService =
  supplierService as jest.Mocked<typeof supplierService>;

describe('Suppliers API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['suppliers:read', 'suppliers:write', 'suppliers:delete'],
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

  it('POST /api/v1/suppliers creates supplier', async () => {
    mockedSupplierService.createSupplier.mockResolvedValue({
      id: 'sup_1',
      organizationId: 'org_1',
      name: 'Acme Supplies',
      email: null,
      phone: null,
      address: null,
      city: null,
      country: null,
      taxId: null,
      notes: null,
      status: PartyStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .post('/api/v1/suppliers')
      .send({ name: 'Acme Supplies' });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Acme Supplies');
  });

  it('GET /api/v1/suppliers returns list', async () => {
    mockedSupplierService.getSuppliers.mockResolvedValue({
      suppliers: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/suppliers');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});
