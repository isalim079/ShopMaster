import { Request, Response } from 'express';

import * as userService from './user.service';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { asyncHandler } from '../../core/utils/async-handler';

export const getMe = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await userService.getMe(req.user!.id);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Profile fetched successfully.',
      data: result,
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await userService.updateProfile(
      req.user!.id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Profile updated successfully.',
      data: result,
    });
  },
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result =
      await userService.changePassword(
        req.user!.id,
        req.body,
      );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);

export const getUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await userService.getUsers();

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Users fetched successfully.',
      data: result,
    });
  },
);

export const updateUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result =
      await userService.updateUserRole(
        id,
        req.body.role,
      );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'User role updated successfully.',
      data: result,
    });
  },
);

export const updateUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result =
      await userService.updateUserStatus(
        id,
        req.body.status,
      );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'User status updated successfully.',
      data: result,
    });
  },
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result =
      await userService.deleteUser(id);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);