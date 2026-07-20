import * as repository from './audit.repository';
import { toAuditLogListResponse } from './audit.mapper';
import type { ListAuditLogsQuery } from './audit.validation';
import type { ListAuditLogsResult } from './audit.types';

export const getAuditLogs = async (
  organizationId: string,
  query: ListAuditLogsQuery,
): Promise<ListAuditLogsResult> => {
  const skip = (query.page - 1) * query.limit;

  const filters: {
    action?: string;
    entity?: string;
    userId?: string;
    from?: Date;
    to?: Date;
  } = {};

  if (query.action !== undefined) filters.action = query.action;
  if (query.entity !== undefined) filters.entity = query.entity;
  if (query.userId !== undefined) filters.userId = query.userId;
  if (query.from !== undefined) filters.from = query.from;
  if (query.to !== undefined) filters.to = query.to;

  const [rows, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    query.limit,
  );

  return {
    logs: toAuditLogListResponse(rows),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 0,
    },
  };
};
