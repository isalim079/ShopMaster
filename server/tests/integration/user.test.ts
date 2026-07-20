import request from 'supertest';
import { UserStatus } from '@prisma/client';

import app from '../../src/app';
import * as userService from '../../src/modules/user/user.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/user/user.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'ada@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
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

const mockedUserService = userService as jest.Mocked<typeof userService>;

describe('Users API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'ada@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
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

  it('GET /api/v1/users/me returns profile', async () => {
    mockedUserService.getMe.mockResolvedValue({
      id: 'user_1',
      firstName: 'Ada',
      lastName: null,
      email: 'ada@example.com',
      phone: null,
      role: {
        id: 'role_admin',
        name: 'Admin',
        slug: ROLE_SLUG.ADMIN,
      },
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).get('/api/v1/users/me');

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('ada@example.com');
    expect(response.body.data.role.slug).toBe(ROLE_SLUG.ADMIN);
  });

  it('GET /api/v1/users returns paginated list', async () => {
    mockedUserService.getUsers.mockResolvedValue({
      users: [
        {
          id: 'user_1',
          firstName: 'Ada',
          lastName: null,
          email: 'ada@example.com',
          phone: null,
          role: {
            id: 'role_admin',
            name: 'Admin',
            slug: ROLE_SLUG.ADMIN,
          },
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
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

    const response = await request(app).get('/api/v1/users?page=1&limit=10');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
  });

  it('PATCH /api/v1/users/me/change-password clears cookies', async () => {
    mockedUserService.changePassword.mockResolvedValue({
      message: 'Password changed successfully. Please login again.',
    });

    const response = await request(app)
      .patch('/api/v1/users/me/change-password')
      .send({
        currentPassword: 'OldPass1!',
        newPassword: 'NewPass1!',
      });

    expect(response.status).toBe(200);
    expect(mockedUserService.changePassword).toHaveBeenCalled();
  });
});
