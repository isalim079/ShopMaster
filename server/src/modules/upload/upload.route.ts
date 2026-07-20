import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

import { Router } from 'express';
import multer from 'multer';

import * as uploadController from './upload.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { listUploadsSchema, uploadIdSchema } from './upload.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';
import { env } from '../../core/config/env';

fs.mkdirSync(path.resolve(env.UPLOAD_DIR), { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(env.UPLOAD_DIR));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.UPLOAD_MAX_BYTES },
});

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.UPLOADS_WRITE),
  upload.single('file'),
  uploadController.createUpload,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.UPLOADS_READ),
  validate(listUploadsSchema),
  uploadController.getUploads,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.UPLOADS_READ),
  validate(uploadIdSchema),
  uploadController.getUploadById,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.UPLOADS_DELETE),
  validate(uploadIdSchema),
  uploadController.deleteUpload,
);

export default router;
