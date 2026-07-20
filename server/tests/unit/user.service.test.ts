import { UserStatus } from '@prisma/client';

import { AppError } from '../../src/core/errors/app-error';
import * as userService from '../../src/modules/user/user.service';
import * as repository from '../../src/modules/user/user.repository';
import * as bcrypt from '../../src/core/security/bcrypt';
import * as authRepository from '../../src/modules/auth/auth.repository';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/user/user.repository');
jest.mock('../../src/core/security/bcrypt');
jest.mock('../../src/modules/auth/auth.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedAuthRepository =
  authRepository as jest.Mocked<typeof authRepository>;

const baseRole = {
  id: 'role_employee',
  name: 'Employee',
  slug: ROLE_SLUG.EMPLOYEE,
  description: null,
  isSystem: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const adminRole = {
  id: 'role_admin',
  name: 'Admin',
  slug: ROLE_SLUG.ADMIN,
  description: null,
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
  organizationId: 'org_1',
  status: UserStatus.ACTIVE,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('user.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('returns mapped user', async () => {
      mockedRepository.findById.mockResolvedValue(baseUser);

      const result = await userService.getMe('user_1');

      expect(result.email).toBe('ada@example.com');
      expect(result.role.slug).toBe(ROLE_SLUG.EMPLOYEE);
      expect(result).not.toHaveProperty('password');
    });

    it('throws when user missing', async () => {
      mockedRepository.findById.mockResolvedValue(null);

      await expect(userService.getMe('missing')).rejects.toBeInstanceOf(
        AppError,
      );
    });
  });

  describe('getUsers', () => {
    it('returns paginated users', async () => {
      mockedRepository.findMany.mockResolvedValue([[baseUser], 1]);

      const result = await userService.getUsers({
        page: 1,
        limit: 10,
      });

      expect(result.users).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('changePassword', () => {
    it('updates password and revokes tokens', async () => {
      mockedRepository.findById.mockResolvedValue(baseUser);
      mockedBcrypt.comparePassword
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockedBcrypt.hashPassword.mockResolvedValue('new-hash');
      mockedRepository.updatePassword.mockResolvedValue(baseUser);
      mockedAuthRepository.revokeAllUserTokens.mockResolvedValue({
        count: 1,
      });

      const result = await userService.changePassword('user_1', {
        currentPassword: 'OldPass1!',
        newPassword: 'NewPass1!',
      });

      expect(mockedRepository.updatePassword).toHaveBeenCalled();
      expect(mockedAuthRepository.revokeAllUserTokens).toHaveBeenCalledWith(
        'user_1',
      );
      expect(result.message).toContain('Password changed');
    });
  });

  describe('deleteUser', () => {
    it('blocks self delete', async () => {
      await expect(
        userService.deleteUser('user_1', 'user_1'),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('deletes another user', async () => {
      mockedRepository.findById.mockResolvedValue({
        ...baseUser,
        id: 'user_2',
      });
      mockedRepository.deleteUser.mockResolvedValue({
        ...baseUser,
        id: 'user_2',
      });

      const result = await userService.deleteUser('user_1', 'user_2');

      expect(result.message).toContain('deleted');
    });
  });

  describe('updateUserRole', () => {
    it('blocks changing own role', async () => {
      await expect(
        userService.updateUserRole('user_1', 'user_1', adminRole.id),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('updates role when valid', async () => {
      mockedRepository.findById.mockResolvedValue({
        ...baseUser,
        id: 'user_2',
      });
      mockedRepository.findRoleById.mockResolvedValue(adminRole);
      mockedRepository.updateRole.mockResolvedValue({
        ...baseUser,
        id: 'user_2',
        roleId: adminRole.id,
        role: adminRole,
      });
      mockedAuthRepository.revokeAllUserTokens.mockResolvedValue({
        count: 1,
      });

      const result = await userService.updateUserRole(
        'user_1',
        'user_2',
        adminRole.id,
      );

      expect(result.role.slug).toBe(ROLE_SLUG.ADMIN);
    });
  });
});
