import { Router } from 'express';

import * as settingController from './setting.controller';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  settingKeyParamSchema,
  updateUserSettingsSchema,
  upsertOrganizationSettingSchema,
  upsertOrganizationSettingsSchema,
} from './setting.validation';
import { ROLE_SLUG } from '../../core/constants/roles';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.get('/me', authenticate, settingController.getMySettings);

router.patch(
  '/me',
  authenticate,
  validate(updateUserSettingsSchema),
  settingController.updateMySettings,
);

router.get(
  '/organization',
  authenticate,
  requirePermission(PERMISSION_SLUG.SETTINGS_READ),
  settingController.getOrganizationSettings,
);

router.put(
  '/organization',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.SETTINGS_WRITE),
  validate(upsertOrganizationSettingsSchema),
  settingController.upsertOrganizationSettings,
);

router.get(
  '/organization/:key',
  authenticate,
  requirePermission(PERMISSION_SLUG.SETTINGS_READ),
  validate(settingKeyParamSchema),
  settingController.getOrganizationSettingByKey,
);

router.put(
  '/organization/:key',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.SETTINGS_WRITE),
  validate(upsertOrganizationSettingSchema),
  settingController.upsertOrganizationSetting,
);

export default router;
