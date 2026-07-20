import { Prisma } from '@prisma/client';

import { prisma } from '../database';

type Client = Prisma.TransactionClient | typeof prisma;

export interface WriteAuditLogInput {
  organizationId: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Prisma.InputJsonValue;
  ip?: string | null;
  userAgent?: string | null;
  tx?: Prisma.TransactionClient;
}

export const writeAuditLog = async (input: WriteAuditLogInput) => {
  const client: Client = input.tx ?? prisma;

  const data: Prisma.AuditLogUncheckedCreateInput = {
    organizationId: input.organizationId,
    userId: input.userId ?? null,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  };

  if (input.meta !== undefined) {
    data.meta = input.meta;
  }

  return client.auditLog.create({ data });
};
