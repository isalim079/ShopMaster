import { AppError } from '../../src/core/errors/app-error';
import * as permissionService from '../../src/modules/permission/permission.service';
import * as repository from '../../src/modules/permission/permission.repository';
import { PERMISSION_SLUG } from '../../src/core/constants/permissions';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/permission/permission.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

const systemPermission = {
  id: 'perm_users_read',
  name: 'Read Users',
  slug: PERMISSION_SLUG.USERS_READ,
  module: 'users',
  description: 'View users',
  isSystem: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const customPermission = {
  id: 'perm_custom',
  name: 'Read Products',
  slug: 'products:read',
  module: 'products',
  description: 'View products',
  isSystem: false,
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

const superAdminRole = {
  ...adminRole,
  id: 'role_super_admin',
  slug: ROLE_SLUG.SUPER_ADMIN,
  name: 'Super Admin',
};

describe('permission.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPermission', () => {
    it('creates custom permission', async () => {
      mockedRepository.findBySlug.mockResolvedValue(null);
      mockedRepository.create.mockResolvedValue(customPermission);

      const result = await permissionService.createPermission({
        name: 'Read Products',
        slug: 'products:read',
        module: 'products',
        description: 'View products',
      });

      expect(result.slug).toBe('products:read');
      expect(result.isSystem).toBe(false);
    });

    it('throws on duplicate slug', async () => {
      mockedRepository.findBySlug.mockResolvedValue(customPermission);

      await expect(
        permissionService.createPermission({
          name: 'Read Products',
          slug: 'products:read',
          module: 'products',
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('deletePermission', () => {
    it('blocks deleting system permission', async () => {
      mockedRepository.findById.mockResolvedValue(systemPermission);

      await expect(
        permissionService.deletePermission(systemPermission.id),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('blocks delete when assigned to roles', async () => {
      mockedRepository.findById.mockResolvedValue(customPermission);
      mockedRepository.countRoleAssignments.mockResolvedValue(1);

      await expect(
        permissionService.deletePermission(customPermission.id),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('syncRolePermissions', () => {
    it('blocks syncing Super Admin', async () => {
      mockedRepository.findRoleById.mockResolvedValue(superAdminRole);

      await expect(
        permissionService.syncRolePermissions(superAdminRole.id, {
          permissionIds: [systemPermission.id],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('syncs permissions for admin role', async () => {
      mockedRepository.findRoleById.mockResolvedValue(adminRole);
      mockedRepository.findByIds.mockResolvedValue([systemPermission]);
      mockedRepository.syncRolePermissions.mockResolvedValue([
        systemPermission,
      ]);

      const result = await permissionService.syncRolePermissions(
        adminRole.id,
        { permissionIds: [systemPermission.id] },
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.slug).toBe(PERMISSION_SLUG.USERS_READ);
    });
  });

  describe('getPermissions', () => {
    it('returns paginated permissions', async () => {
      mockedRepository.findMany.mockResolvedValue([[systemPermission], 1]);

      const result = await permissionService.getPermissions({
        page: 1,
        limit: 10,
      });

      expect(result.permissions).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
