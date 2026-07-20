import { Router } from 'express';

import * as auditController from './audit.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { listAuditLogsSchema } from './audit.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.AUDIT_READ),
  validate(listAuditLogsSchema),
  auditController.getAuditLogs,
);

export default router;
