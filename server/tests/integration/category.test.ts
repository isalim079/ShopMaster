import request from 'supertest';
import { CatalogStatus } from '@prisma/client';

import app from '../../src/app';
import * as categoryService from '../../src/modules/category/category.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/category/category.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['categories:read', 'categories:write', 'categories:delete'],
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

const mockedCategoryService =
  categoryService as jest.Mocked<typeof categoryService>;

describe('Categories API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['categories:read', 'categories:write', 'categories:delete'],
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

  it('POST /api/v1/categories creates category', async () => {
    mockedCategoryService.createCategory.mockResolvedValue({
      id: 'cat_1',
      organizationId: 'org_1',
      name: 'Electronics',
      description: null,
      parentId: null,
      status: CatalogStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Electronics' });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Electronics');
  });

  it('GET /api/v1/categories returns list', async () => {
    mockedCategoryService.getCategories.mockResolvedValue({
      categories: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/categories');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});
