"use server";

import { prisma } from "@/lib/prisma";

interface AuditLogFilters {
  entityType?: string;
  action?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const { entityType, action, userId, limit = 50, offset = 0 } = filters;

  const where: Record<string, unknown> = {};
  if (entityType) where.entityType = entityType;
  if (action) where.action = { contains: action };
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, displayName: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

export async function getAuditLogEntityTypes() {
  const types = await prisma.auditLog.findMany({
    select: { entityType: true },
    distinct: ["entityType"],
  });
  return types.map((t) => t.entityType);
}
