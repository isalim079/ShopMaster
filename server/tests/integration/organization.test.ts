import request from 'supertest';
import { OrganizationStatus } from '@prisma/client';

import app from '../../src/app';
import * as organizationService from '../../src/modules/organization/organization.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/organization/organization.service');
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

const mockedOrganizationService =
  organizationService as jest.Mocked<typeof organizationService>;

describe('Organizations API integration', () => {
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

  it('GET /api/v1/organizations/me returns current org', async () => {
    mockedOrganizationService.getMyOrganization.mockResolvedValue({
      id: 'org_1',
      name: 'Ada Shop',
      slug: 'ada-shop',
      email: null,
      phone: null,
      address: null,
      city: null,
      country: null,
      taxId: null,
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
      logoUrl: null,
      status: OrganizationStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).get('/api/v1/organizations/me');

    expect(response.status).toBe(200);
    expect(response.body.data.slug).toBe('ada-shop');
  });

  it('POST /api/v1/organizations creates org', async () => {
    mockedOrganizationService.createOrganization.mockResolvedValue({
      id: 'org_2',
      name: 'New Shop',
      slug: 'new-shop',
      email: null,
      phone: null,
      address: null,
      city: null,
      country: null,
      taxId: null,
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
      logoUrl: null,
      status: OrganizationStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).post('/api/v1/organizations').send({
      name: 'New Shop',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe('new-shop');
  });
});
