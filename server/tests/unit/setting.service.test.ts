import { ThemePreference } from '@prisma/client';

import { AppError } from '../../src/core/errors/app-error';
import * as settingService from '../../src/modules/setting/setting.service';
import * as repository from '../../src/modules/setting/setting.repository';
import { SETTING_KEY } from '../../src/core/constants/settings';

jest.mock('../../src/modules/setting/setting.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

const baseSetting = {
  id: 'setting_1',
  organizationId: 'org_1',
  key: SETTING_KEY.INVOICE_PREFIX,
  value: 'INV',
  description: 'Prefix used on invoice numbers',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('setting.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMySettings', () => {
    it('returns user theme', async () => {
      mockedRepository.getUserTheme.mockResolvedValue({
        theme: ThemePreference.DARK,
      });

      const result = await settingService.getMySettings('user_1');

      expect(result.theme).toBe(ThemePreference.DARK);
    });

    it('throws when user missing', async () => {
      mockedRepository.getUserTheme.mockResolvedValue(null);

      await expect(settingService.getMySettings('missing')).rejects.toBeInstanceOf(
        AppError,
      );
    });
  });

  describe('updateMySettings', () => {
    it('updates theme', async () => {
      mockedRepository.updateUserTheme.mockResolvedValue({
        theme: ThemePreference.LIGHT,
      });

      const result = await settingService.updateMySettings('user_1', {
        theme: ThemePreference.LIGHT,
      });

      expect(result.theme).toBe(ThemePreference.LIGHT);
    });
  });

  describe('getOrganizationSettings', () => {
    it('ensures defaults then returns list', async () => {
      mockedRepository.ensureDefaultOrganizationSettings.mockResolvedValue([
        baseSetting,
      ]);

      const result = await settingService.getOrganizationSettings('org_1');

      expect(result).toHaveLength(1);
      expect(result[0]?.key).toBe(SETTING_KEY.INVOICE_PREFIX);
    });
  });

  describe('upsertOrganizationSetting', () => {
    it('upserts known key', async () => {
      mockedRepository.upsertOrganizationSetting.mockResolvedValue({
        ...baseSetting,
        value: 'SM',
      });

      const result = await settingService.upsertOrganizationSetting(
        'org_1',
        SETTING_KEY.INVOICE_PREFIX,
        { value: 'SM' },
      );

      expect(result.value).toBe('SM');
    });

    it('rejects unknown key', async () => {
      await expect(
        settingService.upsertOrganizationSetting('org_1', 'unknown.key', {
          value: 'x',
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
