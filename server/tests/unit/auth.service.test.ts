import { OrganizationStatus, UserStatus } from '@prisma/client';

import { AppError } from '../../src/core/errors/app-error';
import * as authService from '../../src/modules/auth/auth.service';
import * as repository from '../../src/modules/auth/auth.repository';
import * as mailService from '../../src/core/mail/mail.service';
import * as bcrypt from '../../src/core/security/bcrypt';
import * as otp from '../../src/core/security/otp';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/auth/auth.repository');
jest.mock('../../src/core/mail/mail.service');
jest.mock('../../src/core/security/bcrypt');
jest.mock('../../src/core/security/otp', () => ({
  ...jest.requireActual('../../src/core/security/otp'),
  generateOtp: jest.fn(() => '123456'),
  hashOtp: jest.fn((value: string) => `hashed-${value}`),
  compareOtp: jest.fn(),
  getOtpExpiry: jest.fn(() => new Date(Date.now() + 10 * 60 * 1000)),
}));

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedMail = mailService as jest.Mocked<typeof mailService>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedOtp = otp as jest.Mocked<typeof otp>;

const baseOrganization = {
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
};

const baseRole = {
  id: 'role_employee',
  name: 'Employee',
  slug: ROLE_SLUG.EMPLOYEE,
  description: 'Standard employee access',
  isSystem: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseUser = {
  id: 'user_1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: null,
  password: 'hashed-password',
  roleId: baseRole.id,
  role: baseRole,
  organizationId: baseOrganization.id,
  organization: baseOrganization,
  status: UserStatus.ACTIVE,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates user and sends verification OTP', async () => {
      mockedRepository.findUserByEmail.mockResolvedValue(null);
      mockedBcrypt.hashPassword.mockResolvedValue('hashed-password');
      mockedRepository.createUser.mockResolvedValue(baseUser);
      mockedRepository.createEmailVerification.mockResolvedValue({
        id: 'ev_1',
        userId: baseUser.id,
        otpHash: 'hashed-123456',
        expiresAt: new Date(),
        verifiedAt: null,
        createdAt: new Date(),
      });
      mockedMail.sendMail.mockResolvedValue();

      const result = await authService.register({
        firstName: 'Ada',
        email: 'ada@example.com',
        password: 'Str0ng!Pass',
        organizationName: 'Ada Shop',
      });

      expect(mockedRepository.createUser).toHaveBeenCalled();
      expect(mockedRepository.createEmailVerification).toHaveBeenCalled();
      expect(mockedMail.sendMail).toHaveBeenCalled();
      expect(result.message).toContain('Registration successful');
    });

    it('throws when email already exists', async () => {
      mockedRepository.findUserByEmail.mockResolvedValue(baseUser);

      await expect(
        authService.register({
          firstName: 'Ada',
          email: 'ada@example.com',
          password: 'Str0ng!Pass',
          organizationName: 'Ada Shop',
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('login', () => {
    it('returns user and tokens for valid credentials', async () => {
      mockedRepository.findUserByEmail.mockResolvedValue(baseUser);
      mockedBcrypt.comparePassword.mockResolvedValue(true);
      mockedRepository.saveRefreshToken.mockResolvedValue({
        id: 'rt_1',
        userId: baseUser.id,
        tokenHash: 'hash',
        expiresAt: new Date(),
        revokedAt: null,
        createdAt: new Date(),
      });

      const result = await authService.login(
        'ada@example.com',
        'Str0ng!Pass',
      );

      expect(result.user.email).toBe('ada@example.com');
      expect(result.user.role.slug).toBe(ROLE_SLUG.EMPLOYEE);
      expect(result.user.organization.slug).toBe('ada-shop');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws for invalid password', async () => {
      mockedRepository.findUserByEmail.mockResolvedValue(baseUser);
      mockedBcrypt.comparePassword.mockResolvedValue(false);

      await expect(
        authService.login('ada@example.com', 'wrong'),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('throws when email is not verified', async () => {
      mockedRepository.findUserByEmail.mockResolvedValue({
        ...baseUser,
        isEmailVerified: false,
        status: UserStatus.PENDING,
      });
      mockedBcrypt.comparePassword.mockResolvedValue(true);

      await expect(
        authService.login('ada@example.com', 'Str0ng!Pass'),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('verifyEmail', () => {
    it('verifies valid OTP', async () => {
      mockedRepository.findUserByEmail.mockResolvedValue({
        ...baseUser,
        isEmailVerified: false,
        status: UserStatus.PENDING,
      });
      mockedRepository.getLatestEmailVerification.mockResolvedValue({
        id: 'ev_1',
        userId: baseUser.id,
        otpHash: 'hashed-123456',
        expiresAt: new Date(Date.now() + 60_000),
        verifiedAt: null,
        createdAt: new Date(),
      });
      mockedOtp.compareOtp.mockReturnValue(true);
      mockedRepository.verifyEmail.mockResolvedValue([
        {
          id: 'ev_1',
          userId: baseUser.id,
          otpHash: 'hashed-123456',
          expiresAt: new Date(),
          verifiedAt: new Date(),
          createdAt: new Date(),
        },
        baseUser,
      ] as never);

      const result = await authService.verifyEmail(
        'ada@example.com',
        '123456',
      );

      expect(result.message).toContain('verified');
      expect(mockedRepository.verifyEmail).toHaveBeenCalled();
    });
  });
});
