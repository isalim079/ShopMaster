import * as repository from './notification.repository';
import {
  toNotificationListResponse,
  toNotificationResponse,
} from './notification.mapper';
import type {
  CreateNotificationInput,
  ListNotificationsQuery,
} from './notification.validation';
import type { ListNotificationsResult } from './notification.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';

export const createNotification = async (
  organizationId: string,
  payload: CreateNotificationInput,
) => {
  const row = await repository.create(organizationId, payload);
  return toNotificationResponse(row);
};

export const getNotifications = async (
  organizationId: string,
  userId: string,
  query: ListNotificationsQuery,
): Promise<ListNotificationsResult> => {
  const filters: { isRead?: boolean } = {};
  if (query.isRead === 'true') filters.isRead = true;
  if (query.isRead === 'false') filters.isRead = false;

  const skip = (query.page - 1) * query.limit;
  const [rows, total] = await repository.findManyForUser(
    organizationId,
    userId,
    filters,
    skip,
    query.limit,
  );

  return {
    notifications: toNotificationListResponse(rows),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 0,
    },
  };
};

export const markAsRead = async (
  organizationId: string,
  userId: string,
  id: string,
) => {
  const row = await repository.findById(organizationId, id);
  if (!row) {
    throw new AppError('Notification not found.', HTTP_STATUS.NOT_FOUND);
  }
  if (row.userId && row.userId !== userId) {
    throw new AppError('Forbidden.', HTTP_STATUS.FORBIDDEN);
  }
  return toNotificationResponse(await repository.markRead(id));
};

export const markAllAsRead = async (
  organizationId: string,
  userId: string,
) => {
  await repository.markAllRead(organizationId, userId);
  return { message: 'All notifications marked as read.' };
};

export const deleteNotification = async (
  organizationId: string,
  id: string,
) => {
  const row = await repository.findById(organizationId, id);
  if (!row) {
    throw new AppError('Notification not found.', HTTP_STATUS.NOT_FOUND);
  }
  await repository.remove(id);
  return { message: 'Notification deleted.' };
};
