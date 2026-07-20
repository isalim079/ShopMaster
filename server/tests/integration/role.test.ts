import request from 'supertest';

import app from '../../src/app';
import * as roleService from '../../src/modules/role/role.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/role/role.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.SUPER_ADMIN,
      roleId: 'role_super_admin',
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

const mockedRoleService = roleService as jest.Mocked<typeof roleService>;

describe('Roles API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.SUPER_ADMIN,
        roleId: 'role_super_admin',
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

  it('POST /api/v1/roles creates role', async () => {
    mockedRoleService.createRole.mockResolvedValue({
      id: 'role_custom',
      name: 'Cashier',
      slug: 'CASHIER',
      description: 'POS',
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).post('/api/v1/roles').send({
      name: 'Cashier',
      slug: 'CASHIER',
      description: 'POS',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe('CASHIER');
  });

  it('GET /api/v1/roles returns list', async () => {
    mockedRoleService.getRoles.mockResolvedValue({
      roles: [
        {
          id: 'role_admin',
          name: 'Admin',
          slug: ROLE_SLUG.ADMIN,
          description: null,
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    const response = await request(app).get('/api/v1/roles');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('POST /api/v1/roles validates slug format', async () => {
    const response = await request(app).post('/api/v1/roles').send({
      name: 'Bad',
      slug: 'bad-slug',
    });

    expect(response.status).toBe(400);
    expect(mockedRoleService.createRole).not.toHaveBeenCalled();
  });
});
