import { Request, Response } from 'express';

import * as notificationService from './notification.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListNotificationsQuery } from './notification.validation';

export const createNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await notificationService.createNotification(
      req.user!.organizationId,
      req.body,
    );
    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Notification created.',
      data,
    });
  },
);

export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await notificationService.getNotifications(
      req.user!.organizationId,
      req.user!.id,
      req.query as unknown as ListNotificationsQuery,
    );
    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Notifications fetched.',
      data: result.notifications,
      meta: result.meta,
    });
  },
);

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const data = await notificationService.markAsRead(
    req.user!.organizationId,
    req.user!.id,
    req.params.id as string,
  );
  return apiResponse({
    res,
    statusCode: HTTP_STATUS.OK,
    message: 'Notification marked as read.',
    data,
  });
});

export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await notificationService.markAllAsRead(
      req.user!.organizationId,
      req.user!.id,
    );
    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);

export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await notificationService.deleteNotification(
      req.user!.organizationId,
      req.params.id as string,
    );
    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);
