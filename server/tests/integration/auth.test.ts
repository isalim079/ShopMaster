import request from 'supertest';
import { UserStatus } from '@prisma/client';

import app from '../../src/app';
import * as authService from '../../src/modules/auth/auth.service';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/auth/auth.service');

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/v1/auth/register returns 201', async () => {
    mockedAuthService.register.mockResolvedValue({
      message: 'Registration successful. Please verify your email.',
    });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Ada',
        email: 'ada@example.com',
        password: 'Str0ng!Pass',
        organizationName: 'Ada Shop',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(mockedAuthService.register).toHaveBeenCalled();
  });

  it('POST /api/v1/auth/register returns 400 on invalid body', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'A',
        email: 'not-an-email',
        password: 'weak',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login returns user without tokens in body', async () => {
    mockedAuthService.login.mockResolvedValue({
      user: {
        id: 'user_1',
        firstName: 'Ada',
        lastName: null,
        email: 'ada@example.com',
        phone: null,
        role: {
          id: 'role_employee',
          name: 'Employee',
          slug: ROLE_SLUG.EMPLOYEE,
        },
        organization: {
          id: 'org_1',
          name: 'Ada Shop',
          slug: 'ada-shop',
        },
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tokens: {
        accessToken: 'access.token',
        refreshToken: 'refresh.token',
      },
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'ada@example.com',
        password: 'Str0ng!Pass',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('ada@example.com');
    expect(response.body.data.tokens).toBeUndefined();
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('POST /api/v1/auth/reset-password validates resetToken', async () => {
    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        email: 'ada@example.com',
        otp: '123456',
        password: 'Str0ng!Pass2',
      });

    expect(response.status).toBe(400);
    expect(mockedAuthService.resetPassword).not.toHaveBeenCalled();
  });
});
