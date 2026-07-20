export interface AuditLogResponse {
  id: string;
  organizationId: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  meta: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface ListAuditLogsResult {
  logs: AuditLogResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
