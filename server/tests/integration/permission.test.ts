import request from 'supertest';

import app from '../../src/app';
import * as permissionService from '../../src/modules/permission/permission.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';
import { PERMISSION_SLUG } from '../../src/core/constants/permissions';

jest.mock('../../src/modules/permission/permission.service');
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

const mockedPermissionService =
  permissionService as jest.Mocked<typeof permissionService>;

describe('Permissions API integration', () => {
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

  it('POST /api/v1/permissions creates permission', async () => {
    mockedPermissionService.createPermission.mockResolvedValue({
      id: 'perm_1',
      name: 'Read Products',
      slug: 'products:read',
      module: 'products',
      description: null,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).post('/api/v1/permissions').send({
      name: 'Read Products',
      slug: 'products:read',
      module: 'products',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe('products:read');
  });

  it('GET /api/v1/permissions returns list', async () => {
    mockedPermissionService.getPermissions.mockResolvedValue({
      permissions: [
        {
          id: 'perm_users_read',
          name: 'Read Users',
          slug: PERMISSION_SLUG.USERS_READ,
          module: 'users',
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

    const response = await request(app).get('/api/v1/permissions');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('POST /api/v1/permissions validates slug format', async () => {
    const response = await request(app).post('/api/v1/permissions').send({
      name: 'Bad',
      slug: 'BAD_SLUG',
      module: 'users',
    });

    expect(response.status).toBe(400);
    expect(mockedPermissionService.createPermission).not.toHaveBeenCalled();
  });
});
