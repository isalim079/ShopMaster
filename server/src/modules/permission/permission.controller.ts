import { Request, Response } from 'express';

import * as permissionService from './permission.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListPermissionsQuery } from './permission.validation';

export const createPermission = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await permissionService.createPermission(req.body);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Permission created successfully.',
      data: result,
    });
  },
);

export const getPermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await permissionService.getPermissions(
      req.query as unknown as ListPermissionsQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Permissions fetched successfully.',
      data: result.permissions,
      meta: result.meta,
    });
  },
);

export const getPermissionById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await permissionService.getPermissionById(id);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Permission fetched successfully.',
      data: result,
    });
  },
);

export const updatePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await permissionService.updatePermission(id, req.body);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Permission updated successfully.',
      data: result,
    });
  },
);

export const deletePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await permissionService.deletePermission(id);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);

export const getRolePermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const roleId = req.params.roleId as string;
    const result = await permissionService.getRolePermissions(roleId);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Role permissions fetched successfully.',
      data: result,
    });
  },
);

export const syncRolePermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const roleId = req.params.roleId as string;
    const result = await permissionService.syncRolePermissions(
      roleId,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Role permissions updated successfully.',
      data: result,
    });
  },
);
