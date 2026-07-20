import { Request, Response } from 'express';

import * as settingService from './setting.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';

export const getMySettings = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await settingService.getMySettings(req.user!.id);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Settings fetched successfully.',
      data: result,
    });
  },
);

export const updateMySettings = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await settingService.updateMySettings(
      req.user!.id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Settings updated successfully.',
      data: result,
    });
  },
);

export const getOrganizationSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await settingService.getOrganizationSettings(
      req.user!.organizationId,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Organization settings fetched successfully.',
      data: result,
    });
  },
);

export const getOrganizationSettingByKey = asyncHandler(
  async (req: Request, res: Response) => {
    const key = req.params.key as string;
    const result = await settingService.getOrganizationSettingByKey(
      req.user!.organizationId,
      key,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Organization setting fetched successfully.',
      data: result,
    });
  },
);

export const upsertOrganizationSetting = asyncHandler(
  async (req: Request, res: Response) => {
    const key = req.params.key as string;
    const result = await settingService.upsertOrganizationSetting(
      req.user!.organizationId,
      key,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Organization setting updated successfully.',
      data: result,
    });
  },
);

export const upsertOrganizationSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await settingService.upsertOrganizationSettings(
      req.user!.organizationId,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Organization settings updated successfully.',
      data: result,
    });
  },
);
