import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

interface AuditLogParams {
  userId: string;
  entityId: string;
  entityType: string;
  action: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

export async function createAuditLog(params: AuditLogParams) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      entityId: params.entityId,
      entityType: params.entityType,
      action: params.action,
      oldValue: (params.oldValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      newValue: (params.newValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    },
  });
}
