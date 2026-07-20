import { AuditLog } from '@prisma/client';

import type { AuditLogResponse } from './audit.types';

export const toAuditLogResponse = (log: AuditLog): AuditLogResponse => ({
  id: log.id,
  organizationId: log.organizationId,
  userId: log.userId,
  action: log.action,
  entity: log.entity,
  entityId: log.entityId,
  meta: log.meta,
  ip: log.ip,
  userAgent: log.userAgent,
  createdAt: log.createdAt,
});

export const toAuditLogListResponse = (items: AuditLog[]) =>
  items.map(toAuditLogResponse);
