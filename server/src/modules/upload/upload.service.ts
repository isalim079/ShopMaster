import fs from 'fs/promises';
import path from 'path';

import { env } from '../../core/config/env';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import * as repository from './upload.repository';
import {
  toUploadListResponse,
  toUploadResponse,
} from './upload.mapper';
import type { ListUploadsQuery } from './upload.validation';
import type { ListUploadsResult } from './upload.types';

export const ensureUploadDir = async () => {
  await fs.mkdir(path.resolve(env.UPLOAD_DIR), { recursive: true });
};

export const createUpload = async (
  organizationId: string,
  userId: string | undefined,
  file: Express.Multer.File,
) => {
  const allowed = env.UPLOAD_ALLOWED_MIME.split(',').map((m) => m.trim());
  if (!allowed.includes(file.mimetype)) {
    throw new AppError('File type not allowed.', HTTP_STATUS.BAD_REQUEST);
  }

  await ensureUploadDir();

  const url = `${env.UPLOAD_STATIC_PATH}/${file.filename}`;
  const relativePath = path.join(env.UPLOAD_DIR, file.filename);

  const upload = await repository.create({
    organizationId,
    userId: userId ?? null,
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    path: relativePath,
    url,
  });

  return toUploadResponse(upload);
};

export const getUploads = async (
  organizationId: string,
  query: ListUploadsQuery,
): Promise<ListUploadsResult> => {
  const skip = (query.page - 1) * query.limit;
  const filters: { search?: string } = {};
  if (query.search) filters.search = query.search;

  const [rows, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    query.limit,
  );

  return {
    uploads: toUploadListResponse(rows),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 0,
    },
  };
};

export const getUploadById = async (
  organizationId: string,
  id: string,
) => {
  const upload = await repository.findById(organizationId, id);
  if (!upload) {
    throw new AppError('Upload not found.', HTTP_STATUS.NOT_FOUND);
  }
  return toUploadResponse(upload);
};

export const deleteUpload = async (
  organizationId: string,
  id: string,
) => {
  const upload = await repository.findById(organizationId, id);
  if (!upload) {
    throw new AppError('Upload not found.', HTTP_STATUS.NOT_FOUND);
  }

  await repository.remove(id);

  try {
    await fs.unlink(path.resolve(upload.path));
  } catch {
    // file may already be gone
  }

  return { message: 'Upload deleted.' };
};
