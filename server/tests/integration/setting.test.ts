import request from 'supertest';
import { ThemePreference } from '@prisma/client';

import app from '../../src/app';
import * as settingService from '../../src/modules/setting/setting.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';
import { SETTING_KEY } from '../../src/core/constants/settings';

jest.mock('../../src/modules/setting/setting.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['settings:read', 'settings:write'],
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

const mockedSettingService = settingService as jest.Mocked<typeof settingService>;

describe('Settings API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['settings:read', 'settings:write'],
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

  it('GET /api/v1/settings/me returns theme', async () => {
    mockedSettingService.getMySettings.mockResolvedValue({
      theme: ThemePreference.DARK,
    });

    const response = await request(app).get('/api/v1/settings/me');

    expect(response.status).toBe(200);
    expect(response.body.data.theme).toBe('DARK');
  });

  it('PATCH /api/v1/settings/me updates theme', async () => {
    mockedSettingService.updateMySettings.mockResolvedValue({
      theme: ThemePreference.LIGHT,
    });

    const response = await request(app)
      .patch('/api/v1/settings/me')
      .send({ theme: 'LIGHT' });

    expect(response.status).toBe(200);
    expect(mockedSettingService.updateMySettings).toHaveBeenCalled();
  });

  it('GET /api/v1/settings/organization returns list', async () => {
    mockedSettingService.getOrganizationSettings.mockResolvedValue([
      {
        id: 'setting_1',
        key: SETTING_KEY.INVOICE_PREFIX,
        value: 'INV',
        description: 'Prefix used on invoice numbers',
        updatedAt: new Date(),
      },
    ]);

    const response = await request(app).get('/api/v1/settings/organization');

    expect(response.status).toBe(200);
    expect(response.body.data[0].key).toBe(SETTING_KEY.INVOICE_PREFIX);
  });

  it('PUT /api/v1/settings/organization/:key updates value', async () => {
    mockedSettingService.upsertOrganizationSetting.mockResolvedValue({
      id: 'setting_1',
      key: SETTING_KEY.INVOICE_PREFIX,
      value: 'SM',
      description: 'Prefix used on invoice numbers',
      updatedAt: new Date(),
    });

    const response = await request(app)
      .put(`/api/v1/settings/organization/${SETTING_KEY.INVOICE_PREFIX}`)
      .send({ value: 'SM' });

    expect(response.status).toBe(200);
    expect(response.body.data.value).toBe('SM');
  });
});
