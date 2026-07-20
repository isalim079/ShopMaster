import request from 'supertest';
import { CatalogStatus } from '@prisma/client';

import app from '../../src/app';
import * as brandService from '../../src/modules/brand/brand.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/brand/brand.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['brands:read', 'brands:write', 'brands:delete'],
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

const mockedBrandService =
  brandService as jest.Mocked<typeof brandService>;

describe('Brands API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['brands:read', 'brands:write', 'brands:delete'],
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

  it('POST /api/v1/brands creates brand', async () => {
    mockedBrandService.createBrand.mockResolvedValue({
      id: 'brand_1',
      organizationId: 'org_1',
      name: 'Nike',
      description: null,
      logoUrl: null,
      status: CatalogStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .post('/api/v1/brands')
      .send({ name: 'Nike' });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Nike');
  });

  it('GET /api/v1/brands returns list', async () => {
    mockedBrandService.getBrands.mockResolvedValue({
      brands: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/brands');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});
