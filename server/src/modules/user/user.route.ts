import { Router } from 'express';
import { UserRole } from '@prisma/client';

import * as userController from './user.controller';
import { authenticate, authorize } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  changePasswordSchema,
  updateProfileSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userIdSchema,
} from './user.validation';

const router = Router();

/**
 * Current User
 */
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

/**
 * Admin
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  userController.getUsers,
);

router.patch(
  '/:id/role',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validate(updateUserRoleSchema),
  userController.updateUserRole,
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(updateUserStatusSchema),
  userController.updateUserStatus,
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validate(userIdSchema),
  userController.deleteUser,
);

export default router;