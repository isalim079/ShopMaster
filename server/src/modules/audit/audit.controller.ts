import { Request, Response } from 'express';

import * as auditService from './audit.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import type { ListAuditLogsQuery } from './audit.validation';

export const getAuditLogs = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await auditService.getAuditLogs(
      req.user!.organizationId,
      req.query as unknown as ListAuditLogsQuery,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Audit logs fetched.',
      data: result.logs,
      meta: result.meta,
    });
  },
);
