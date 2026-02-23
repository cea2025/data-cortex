"use server";

import { prisma } from "@/lib/prisma";
import { resolveOrgId } from "@/lib/org";
import { requireUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/rbac";
import { createAuditLog } from "@/lib/audit";

export async function getOrganizationRules(orgSlug: string) {
  await requireUser();
  const organizationId = await resolveOrgId(orgSlug);
  return prisma.organizationRule.findMany({
    where: { organizationId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function addOrganizationRule(orgSlug: string, content: string) {
  const user = await requireAdmin();
  const organizationId = await resolveOrgId(orgSlug);

  const rule = await prisma.organizationRule.create({
    data: {
      content,
      authorId: user.id,
      organizationId,
    },
    include: { author: true },
  });

  await createAuditLog({
    userId: user.id,
    entityId: rule.id,
    entityType: "OrganizationRule",
    action: "create",
    organizationId,
    newValue: { content },
  });

  return rule;
}

export async function deleteOrganizationRule(id: string, orgSlug: string) {
  const user = await requireAdmin();
  const organizationId = await resolveOrgId(orgSlug);
  const rule = await prisma.organizationRule.findFirst({
    where: { id, organizationId },
  });
  if (!rule) throw new Error("Rule not found");
  await prisma.organizationRule.delete({ where: { id } });

  await createAuditLog({
    userId: user.id,
    entityId: id,
    entityType: "OrganizationRule",
    action: "delete",
    organizationId,
    oldValue: { content: rule.content },
  });
}

export async function upvoteKnowledgeItem(itemId: string) {
  await requireUser();
  return prisma.knowledgeItem.update({
    where: { id: itemId },
    data: { upvotes: { increment: 1 } },
    select: { id: true, upvotes: true },
  });
}
