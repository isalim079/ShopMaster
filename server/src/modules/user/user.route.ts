import { Router } from 'express';

import * as userController from './user.controller';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  changePasswordSchema,
  listUsersSchema,
  updateProfileSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userIdSchema,
} from './user.validation';
import { ROLE_SLUG } from '../../core/constants/roles';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.get(
  '/me',
  authenticate,
  userController.getMe,
);

router.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile,
);

router.patch(
  '/me/change-password',
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword,
);

router.get(
  '/',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.USERS_READ),
  validate(listUsersSchema),
  userController.getUsers,
);

router.patch(
  '/:id/role',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.USERS_WRITE),
  validate(updateUserRoleSchema),
  userController.updateUserRole,
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN, ROLE_SLUG.ADMIN),
  requirePermission(PERMISSION_SLUG.USERS_WRITE),
  validate(updateUserStatusSchema),
  userController.updateUserStatus,
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLE_SLUG.SUPER_ADMIN),
  requirePermission(PERMISSION_SLUG.USERS_DELETE),
  validate(userIdSchema),
  userController.deleteUser,
);

export default router;
