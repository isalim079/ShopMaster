import { Router } from 'express';

import * as roleController from './role.controller';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createRoleSchema,
  listRolesSchema,
  roleIdSchema,
  updateRoleSchema,
} from './role.validation';
import { ROLE_SLUG } from '../../core/constants/roles';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.ROLES_WRITE),
  validate(createRoleSchema),
  roleController.createRole,
);

router.get(
  '/',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.ROLES_READ),
  validate(listRolesSchema),
  roleController.getRoles,
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.ROLES_READ),
  validate(roleIdSchema),
  roleController.getRoleById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.ROLES_WRITE),
  validate(updateRoleSchema),
  roleController.updateRole,
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.ROLES_DELETE),
  validate(roleIdSchema),
  roleController.deleteRole,
);

export default router;
