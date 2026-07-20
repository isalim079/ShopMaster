import { OrganizationStatus } from '@prisma/client';

import { AppError } from '../../src/core/errors/app-error';
import * as organizationService from '../../src/modules/organization/organization.service';
import * as repository from '../../src/modules/organization/organization.repository';
import * as settingRepository from '../../src/modules/setting/setting.repository';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/organization/organization.repository');
jest.mock('../../src/modules/setting/setting.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedSettingRepository =
  settingRepository as jest.Mocked<typeof settingRepository>;

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

describe('organization.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrganization', () => {
    it('creates organization', async () => {
      mockedRepository.create.mockResolvedValue(baseOrganization);
      mockedSettingRepository.ensureDefaultOrganizationSettings.mockResolvedValue(
        [],
      );

      const result = await organizationService.createOrganization({
        name: 'Ada Shop',
      });

      expect(result.slug).toBe('ada-shop');
      expect(
        mockedSettingRepository.ensureDefaultOrganizationSettings,
      ).toHaveBeenCalledWith('org_1');
    });
  });

  describe('getOrganizationById', () => {
    it('allows own organization for admin', async () => {
      mockedRepository.findById.mockResolvedValue(baseOrganization);

      const result = await organizationService.getOrganizationById(
        {
          role: ROLE_SLUG.ADMIN,
          organizationId: 'org_1',
        },
        'org_1',
      );

      expect(result.id).toBe('org_1');
    });

    it('blocks other organization for admin', async () => {
      await expect(
        organizationService.getOrganizationById(
          {
            role: ROLE_SLUG.ADMIN,
            organizationId: 'org_1',
          },
          'org_2',
        ),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('deleteOrganization', () => {
    it('blocks deleting default organization', async () => {
      mockedRepository.findById.mockResolvedValue({
        ...baseOrganization,
        id: 'org_default',
      });

      await expect(
        organizationService.deleteOrganization('org_default'),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('deactivates organization', async () => {
      mockedRepository.findById.mockResolvedValue(baseOrganization);
      mockedRepository.deactivate.mockResolvedValue({
        ...baseOrganization,
        status: OrganizationStatus.INACTIVE,
      });

      const result = await organizationService.deleteOrganization('org_1');

      expect(result.message).toContain('deactivated');
    });
  });
});
