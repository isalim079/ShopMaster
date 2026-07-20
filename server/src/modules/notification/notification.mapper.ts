import { Notification } from '@prisma/client';

import type { NotificationResponse } from './notification.types';

export const toNotificationResponse = (
  notification: Notification,
): NotificationResponse => ({
  id: notification.id,
  organizationId: notification.organizationId,
  userId: notification.userId,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  isRead: notification.isRead,
  link: notification.link,
  createdAt: notification.createdAt,
});

export const toNotificationListResponse = (items: Notification[]) =>
  items.map(toNotificationResponse);
