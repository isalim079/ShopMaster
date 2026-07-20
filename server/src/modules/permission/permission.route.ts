import { Router } from 'express';

import * as permissionController from './permission.controller';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createPermissionSchema,
  listPermissionsSchema,
  permissionIdSchema,
  roleIdParamSchema,
  syncRolePermissionsSchema,
  updatePermissionSchema,
} from './permission.validation';
import { ROLE_SLUG } from '../../core/constants/roles';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.PERMISSIONS_WRITE),
  validate(createPermissionSchema),
  permissionController.createPermission,
);

router.get(
  '/',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.PERMISSIONS_READ),
  validate(listPermissionsSchema),
  permissionController.getPermissions,
);

router.get(
  '/role/:roleId',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.PERMISSIONS_READ),
  validate(roleIdParamSchema),
  permissionController.getRolePermissions,
);

router.put(
  '/role/:roleId',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.PERMISSIONS_WRITE),
  validate(syncRolePermissionsSchema),
  permissionController.syncRolePermissions,
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.PERMISSIONS_READ),
  validate(permissionIdSchema),
  permissionController.getPermissionById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.PERMISSIONS_WRITE),
  validate(updatePermissionSchema),
  permissionController.updatePermission,
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.PERMISSIONS_DELETE),
  validate(permissionIdSchema),
  permissionController.deletePermission,
);

export default router;
