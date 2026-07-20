import { Router } from 'express';

import * as notificationController from './notification.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createNotificationSchema,
  listNotificationsSchema,
  notificationIdSchema,
} from './notification.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.NOTIFICATIONS_READ),
  validate(listNotificationsSchema),
  notificationController.getNotifications,
);

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.NOTIFICATIONS_WRITE),
  validate(createNotificationSchema),
  notificationController.createNotification,
);

router.patch(
  '/read-all',
  authenticate,
  requirePermission(PERMISSION_SLUG.NOTIFICATIONS_READ),
  notificationController.markAllAsRead,
);

router.patch(
  '/:id/read',
  authenticate,
  requirePermission(PERMISSION_SLUG.NOTIFICATIONS_READ),
  validate(notificationIdSchema),
  notificationController.markAsRead,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.NOTIFICATIONS_WRITE),
  validate(notificationIdSchema),
  notificationController.deleteNotification,
);

export default router;
