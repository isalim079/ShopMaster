import request from 'supertest';
import { PartyStatus } from '@prisma/client';

import app from '../../src/app';
import * as customerService from '../../src/modules/customer/customer.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/customer/customer.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['customers:read', 'customers:write', 'customers:delete'],
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

const mockedCustomerService =
  customerService as jest.Mocked<typeof customerService>;

describe('Customers API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['customers:read', 'customers:write', 'customers:delete'],
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

  it('POST /api/v1/customers creates customer', async () => {
    mockedCustomerService.createCustomer.mockResolvedValue({
      id: 'cust_1',
      organizationId: 'org_1',
      name: 'Walk-in Buyer',
      email: null,
      phone: null,
      address: null,
      city: null,
      country: null,
      taxId: null,
      creditLimit: null,
      notes: null,
      status: PartyStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .post('/api/v1/customers')
      .send({ name: 'Walk-in Buyer' });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Walk-in Buyer');
  });

  it('GET /api/v1/customers returns list', async () => {
    mockedCustomerService.getCustomers.mockResolvedValue({
      customers: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/customers');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});
