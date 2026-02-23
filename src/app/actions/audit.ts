"use server";

import { prisma } from "@/lib/prisma";
import { resolveOrgId } from "@/lib/org";
import { requireAdmin } from "@/lib/auth/rbac";

interface AuditLogFilters {
  entityType?: string;
  action?: string;
  userId?: string;
  limit?: number;
  offset?: number;
  orgSlug?: string;
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  await requireAdmin();

  const { entityType, action, userId, limit = 50, offset = 0, orgSlug } = filters;

  const where: Record<string, unknown> = {};
  if (entityType) where.entityType = entityType;
  if (action) where.action = { contains: action };
  if (userId) where.userId = userId;
  if (orgSlug) where.organizationId = await resolveOrgId(orgSlug);

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

export async function getAuditLogEntityTypes(orgSlug?: string) {
  await requireAdmin();

  const where: Record<string, unknown> = {};
  if (orgSlug) where.organizationId = await resolveOrgId(orgSlug);

  const types = await prisma.auditLog.findMany({
    where,
    select: { entityType: true },
    distinct: ["entityType"],
  });
  return types.map((t) => t.entityType);
}
