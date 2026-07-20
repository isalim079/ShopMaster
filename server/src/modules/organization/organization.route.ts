import { Router } from 'express';

import * as organizationController from './organization.controller';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createOrganizationSchema,
  listOrganizationsSchema,
  organizationIdSchema,
  updateMyOrganizationSchema,
  updateOrganizationSchema,
} from './organization.validation';
import { ROLE_SLUG } from '../../core/constants/roles';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.get(
  '/me',
  authenticate,
  requirePermission(PERMISSION_SLUG.ORGANIZATIONS_READ),
  organizationController.getMyOrganization,
);

router.patch(
  '/me',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.ORGANIZATIONS_WRITE),
  validate(updateMyOrganizationSchema),
  organizationController.updateMyOrganization,
);

router.post(
  '/',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.ORGANIZATIONS_WRITE),
  validate(createOrganizationSchema),
  organizationController.createOrganization,
);

router.get(
  '/',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.ORGANIZATIONS_READ),
  validate(listOrganizationsSchema),
  organizationController.getOrganizations,
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.ORGANIZATIONS_READ),
  validate(organizationIdSchema),
  organizationController.getOrganizationById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.ORGANIZATIONS_WRITE),
  validate(updateOrganizationSchema),
  organizationController.updateOrganization,
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.ORGANIZATIONS_DELETE),
  validate(organizationIdSchema),
  organizationController.deleteOrganization,
);

export default router;
