"use server";

import { prisma } from "@/lib/prisma";
import { resolveOrgId } from "@/lib/org";
import { requireAdmin } from "@/lib/auth/rbac";
import { createAuditLog } from "@/lib/audit";
import type { UserRole, UserStatus } from "@/generated/prisma/client";

export async function getOrgUsers(orgSlug: string) {
  await requireAdmin();
  const organizationId = await resolveOrgId(orgSlug);
  return prisma.userProfile.findMany({
    where: { organizationId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function approveUser(userId: string, orgSlug: string) {
  const admin = await requireAdmin();
  const organizationId = await resolveOrgId(orgSlug);

  const target = await prisma.userProfile.findFirst({
    where: { id: userId, organizationId },
  });
  if (!target) throw new Error("User not found in this organization");
  if (target.status !== "PENDING") throw new Error("User is not pending");

  const updated = await prisma.userProfile.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  await createAuditLog({
    userId: admin.id,
    entityId: userId,
    entityType: "UserProfile",
    action: "approve_user",
    organizationId,
    oldValue: { status: "PENDING" },
    newValue: { status: "ACTIVE" },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: "account_approved",
      title: "החשבון שלך אושר!",
      message: "מנהל המערכת אישר את הגישה שלך. כעת ניתן להשתמש במערכת.",
    },
  });

  return updated;
}

export async function suspendUser(userId: string, orgSlug: string) {
  const admin = await requireAdmin();
  const organizationId = await resolveOrgId(orgSlug);

  const target = await prisma.userProfile.findFirst({
    where: { id: userId, organizationId },
  });
  if (!target) throw new Error("User not found in this organization");
  if (target.isSuperAdmin) throw new Error("Cannot suspend a super admin");

  const updated = await prisma.userProfile.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
  });

  await createAuditLog({
    userId: admin.id,
    entityId: userId,
    entityType: "UserProfile",
    action: "suspend_user",
    organizationId,
    oldValue: { status: target.status },
    newValue: { status: "SUSPENDED" },
  });

  return updated;
}

export async function reactivateUser(userId: string, orgSlug: string) {
  const admin = await requireAdmin();
  const organizationId = await resolveOrgId(orgSlug);

  const target = await prisma.userProfile.findFirst({
    where: { id: userId, organizationId },
  });
  if (!target) throw new Error("User not found");

  const updated = await prisma.userProfile.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  await createAuditLog({
    userId: admin.id,
    entityId: userId,
    entityType: "UserProfile",
    action: "reactivate_user",
    organizationId,
    oldValue: { status: target.status },
    newValue: { status: "ACTIVE" },
  });

  return updated;
}

export async function changeUserRole(userId: string, newRole: UserRole, orgSlug: string) {
  const admin = await requireAdmin();
  const organizationId = await resolveOrgId(orgSlug);

  const target = await prisma.userProfile.findFirst({
    where: { id: userId, organizationId },
  });
  if (!target) throw new Error("User not found");
  if (target.isSuperAdmin) throw new Error("Cannot change super admin role");

  const updated = await prisma.userProfile.update({
    where: { id: userId },
    data: { role: newRole },
  });

  await createAuditLog({
    userId: admin.id,
    entityId: userId,
    entityType: "UserProfile",
    action: "change_role",
    organizationId,
    oldValue: { role: target.role },
    newValue: { role: newRole },
  });

  return updated;
}
