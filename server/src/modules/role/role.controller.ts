import { Request, Response } from 'express';

import * as roleService from './role.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListRolesQuery } from './role.validation';

export const createRole = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await roleService.createRole(req.body);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Role created successfully.',
      data: result,
    });
  },
);

export const getRoles = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await roleService.getRoles(
      req.query as unknown as ListRolesQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Roles fetched successfully.',
      data: result.roles,
      meta: result.meta,
    });
  },
);

export const getRoleById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await roleService.getRoleById(id);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Role fetched successfully.',
      data: result,
    });
  },
);

export const updateRole = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await roleService.updateRole(id, req.body);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Role updated successfully.',
      data: result,
    });
  },
);

export const deleteRole = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await roleService.deleteRole(id);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);
