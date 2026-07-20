import { Upload } from '@prisma/client';

import type { UploadResponse } from './upload.types';

export const toUploadResponse = (upload: Upload): UploadResponse => ({
  id: upload.id,
  organizationId: upload.organizationId,
  userId: upload.userId,
  filename: upload.filename,
  originalName: upload.originalName,
  mimeType: upload.mimeType,
  size: upload.size,
  path: upload.path,
  url: upload.url,
  createdAt: upload.createdAt,
});

export const toUploadListResponse = (items: Upload[]) =>
  items.map(toUploadResponse);
