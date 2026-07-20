import { Request, Response } from 'express';

import * as organizationService from './organization.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListOrganizationsQuery } from './organization.validation';

export const createOrganization = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await organizationService.createOrganization(req.body);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'Organization created successfully.',
      data: result,
    });
  },
);

export const getOrganizations = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await organizationService.getOrganizations(
      req.query as unknown as ListOrganizationsQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Organizations fetched successfully.',
      data: result.organizations,
      meta: result.meta,
    });
  },
);

export const getMyOrganization = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await organizationService.getMyOrganization(
      req.user!.organizationId,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Organization fetched successfully.',
      data: result,
    });
  },
);

export const updateMyOrganization = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await organizationService.updateMyOrganization(
      req.user!.organizationId,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Organization updated successfully.',
      data: result,
    });
  },
);

export const getOrganizationById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await organizationService.getOrganizationById(
      {
        role: req.user!.role,
        organizationId: req.user!.organizationId,
      },
      id,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Organization fetched successfully.',
      data: result,
    });
  },
);

export const updateOrganization = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await organizationService.updateOrganization(
      {
        role: req.user!.role,
        organizationId: req.user!.organizationId,
      },
      id,
      req.body,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Organization updated successfully.',
      data: result,
    });
  },
);

export const deleteOrganization = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await organizationService.deleteOrganization(id);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);
