import { AppError } from '../../src/core/errors/app-error';
import * as roleService from '../../src/modules/role/role.service';
import * as repository from '../../src/modules/role/role.repository';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/role/role.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

const systemRole = {
  id: 'role_admin',
  name: 'Admin',
  slug: ROLE_SLUG.ADMIN,
  description: 'Administrative access',
  isSystem: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const customRole = {
  id: 'clxxxxxxxxxxxxxxxxxxxxxx',
  name: 'Cashier',
  slug: 'CASHIER',
  description: 'POS access',
  isSystem: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('role.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRole', () => {
    it('creates custom role', async () => {
      mockedRepository.findBySlug.mockResolvedValue(null);
      mockedRepository.create.mockResolvedValue(customRole);

      const result = await roleService.createRole({
        name: 'Cashier',
        slug: 'CASHIER',
        description: 'POS access',
      });

      expect(result.slug).toBe('CASHIER');
      expect(result.isSystem).toBe(false);
    });

    it('throws on duplicate slug', async () => {
      mockedRepository.findBySlug.mockResolvedValue(customRole);

      await expect(
        roleService.createRole({
          name: 'Cashier',
          slug: 'CASHIER',
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('getRoles', () => {
    it('returns paginated roles', async () => {
      mockedRepository.findMany.mockResolvedValue([[systemRole], 1]);

      const result = await roleService.getRoles({
        page: 1,
        limit: 10,
      });

      expect(result.roles).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('deleteRole', () => {
    it('blocks deleting system role', async () => {
      mockedRepository.findById.mockResolvedValue(systemRole);

      await expect(
        roleService.deleteRole(systemRole.id),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('blocks delete when users assigned', async () => {
      mockedRepository.findById.mockResolvedValue(customRole);
      mockedRepository.countUsersByRoleId.mockResolvedValue(2);

      await expect(
        roleService.deleteRole(customRole.id),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('deletes unused custom role', async () => {
      mockedRepository.findById.mockResolvedValue(customRole);
      mockedRepository.countUsersByRoleId.mockResolvedValue(0);
      mockedRepository.remove.mockResolvedValue(customRole);

      const result = await roleService.deleteRole(customRole.id);

      expect(result.message).toContain('deleted');
    });
  });
});
