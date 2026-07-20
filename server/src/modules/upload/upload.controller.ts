import { Request, Response } from 'express';

import * as uploadService from './upload.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { AppError } from '../../core/errors/app-error';
import type { ListUploadsQuery } from './upload.validation';

export const createUpload = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('File is required.', HTTP_STATUS.BAD_REQUEST);
    }

    const data = await uploadService.createUpload(
      req.user!.organizationId,
      req.user!.id,
      req.file,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: 'File uploaded.',
      data,
    });
  },
);

export const getUploads = asyncHandler(async (req: Request, res: Response) => {
  const result = await uploadService.getUploads(
    req.user!.organizationId,
    req.query as unknown as ListUploadsQuery,
  );

  return apiResponse({
    res,
    statusCode: HTTP_STATUS.OK,
    message: 'Uploads fetched.',
    data: result.uploads,
    meta: result.meta,
  });
});

export const getUploadById = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await uploadService.getUploadById(
      req.user!.organizationId,
      req.params.id as string,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Upload fetched.',
      data,
    });
  },
);

export const deleteUpload = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await uploadService.deleteUpload(
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
