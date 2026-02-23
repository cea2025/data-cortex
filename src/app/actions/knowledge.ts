"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/utils";
import { resolveOrgId } from "@/lib/org";
import type { KnowledgeItemType } from "@/generated/prisma/client";

// ─── Submit Draft (status -> "review") ───────────────────────────

interface SubmitDraftParams {
  dataAssetId: string;
  title: string;
  itemType: KnowledgeItemType;
  contentHebrew?: string;
  contentEnglish?: string;
  isCanonical?: boolean;
  orgSlug?: string;
}

export interface SubmitDraftResult {
  success: true;
  item: Awaited<ReturnType<typeof prisma.knowledgeItem.create>>;
  suggestBulk?: boolean;
  duplicateAssets?: { id: string; tableName: string | null }[];
}

export async function submitKnowledgeDraft(
  params: SubmitDraftParams
): Promise<SubmitDraftResult> {
  const user = await requireUser();
  const organizationId = params.orgSlug
    ? await resolveOrgId(params.orgSlug)
    : user.organizationId;

  const userIsAdmin = isAdmin(user);
  const autoApprove = userIsAdmin;
  const status = autoApprove ? "approved" : "review";

  const item = await prisma.knowledgeItem.create({
    data: {
      dataAssetId: params.dataAssetId,
      authorId: user.id,
      title: params.title,
      itemType: params.itemType,
      contentHebrew: params.contentHebrew,
      contentEnglish: params.contentEnglish,
      isCanonical: params.isCanonical ?? false,
      status,
      reviewerId: autoApprove ? user.id : undefined,
      verifiedAt: autoApprove ? new Date() : undefined,
      organizationId,
      sourceProvenance: {
        addedBy: user.id,
        source: autoApprove ? "Admin Direct Publish" : "Manual Documentation",
      },
    },
    include: { author: true, dataAsset: true },
  });

  await createAuditLog({
    userId: user.id,
    entityId: item.id,
    entityType: "KnowledgeItem",
    action: autoApprove ? "admin_direct_publish" : "submit_draft",
    organizationId,
    newValue: {
      title: item.title,
      itemType: item.itemType,
      status,
      dataAssetId: item.dataAssetId,
      isCanonical: item.isCanonical,
    },
  });

  if (item.dataAsset.ownerId && item.dataAsset.ownerId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: item.dataAsset.ownerId,
        type: "review_request",
        title: "פריט ידע חדש ממתין לאישור",
        message: `${item.title} — ${item.dataAsset.columnName ?? item.dataAsset.tableName ?? item.dataAsset.systemName}`,
        link: `/assets/${params.dataAssetId}`,
      },
    });
  }

  revalidatePath(`/assets/${params.dataAssetId}`);
  revalidatePath("/notifications");

  const result: SubmitDraftResult = { success: true, item };

  if (params.isCanonical && item.dataAsset.columnName && organizationId) {
    const duplicates = await prisma.dataAsset.findMany({
      where: {
        organizationId,
        assetType: "column",
        columnName: item.dataAsset.columnName,
        id: { not: item.dataAssetId },
        knowledgeItems: {
          none: { isCanonical: true },
        },
      },
      select: { id: true, tableName: true },
    });

    if (duplicates.length > 0) {
      result.suggestBulk = true;
      result.duplicateAssets = duplicates;
    }
  }

  return result;
}

export async function submitBulkKnowledge(params: {
  title: string;
  itemType: KnowledgeItemType;
  contentHebrew?: string;
  contentEnglish?: string;
  assetIds: string[];
  orgSlug?: string;
}) {
  const user = await requireUser();
  const organizationId = params.orgSlug
    ? await resolveOrgId(params.orgSlug)
    : user.organizationId;

  const items = await prisma.$transaction(
    params.assetIds.map((assetId) =>
      prisma.knowledgeItem.create({
        data: {
          dataAssetId: assetId,
          authorId: user.id,
          title: params.title,
          itemType: params.itemType,
          contentHebrew: params.contentHebrew,
          contentEnglish: params.contentEnglish,
          isCanonical: true,
          status: "review",
          organizationId,
          sourceProvenance: {
            addedBy: user.id,
            source: "Bulk Canonical Definition",
          },
        },
      })
    )
  );

  for (const item of items) {
    await createAuditLog({
      userId: user.id,
      entityId: item.id,
      entityType: "KnowledgeItem",
      action: "submit_draft",
      organizationId,
      newValue: {
        title: item.title,
        itemType: item.itemType,
        isCanonical: true,
        bulkApplied: true,
      },
    });
  }

  return { success: true, count: items.length };
}

// ─── Update Status (approve / reject / review) ─────────────────

export async function updateKnowledgeStatus(
  itemId: string,
  newStatus: "approved" | "rejected"
) {
  const user = await requireUser();

  const existing = await prisma.knowledgeItem.findUnique({
    where: { id: itemId },
    include: { dataAsset: { select: { ownerId: true } } },
  });

  if (!existing) throw new Error("Knowledge item not found");

  const userIsAdmin = isAdmin(user);
  const isAssetOwner = existing.dataAsset.ownerId === user.id;
  if (!userIsAdmin && !isAssetOwner) {
    throw new Error("Forbidden: Only asset owner or admin can approve/reject");
  }

  const updated = await prisma.knowledgeItem.update({
    where: { id: itemId },
    data: {
      status: newStatus,
      reviewerId: user.id,
      verifiedAt: newStatus === "approved" ? new Date() : undefined,
    },
    include: { author: true, reviewer: true, dataAsset: true },
  });

  await createAuditLog({
    userId: user.id,
    entityId: itemId,
    entityType: "KnowledgeItem",
    action: `status_change_to_${newStatus}`,
    organizationId: existing.organizationId,
    oldValue: { status: existing.status },
    newValue: { status: newStatus, reviewerId: user.id },
  });

  if (existing.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: existing.authorId,
        type: "status_change",
        title:
          newStatus === "approved"
            ? "פריט הידע שלך אושר!"
            : "פריט הידע שלך נדחה",
        message: `${existing.title}`,
        link: `/assets/${existing.dataAssetId}`,
      },
    });
  }

  revalidatePath(`/assets/${existing.dataAssetId}`);
  revalidatePath("/notifications");

  return updated;
}

// ─── Admin Force Approve ─────────────────────────────────────────

export async function forceApproveKnowledgeItem(itemId: string) {
  const user = await requireUser();
  if (!isAdmin(user)) throw new Error("Forbidden: Admin access required");

  const existing = await prisma.knowledgeItem.findUnique({
    where: { id: itemId },
  });
  if (!existing) throw new Error("Knowledge item not found");

  const updated = await prisma.knowledgeItem.update({
    where: { id: itemId },
    data: {
      status: "approved",
      reviewerId: user.id,
      verifiedAt: new Date(),
    },
    include: { author: true, reviewer: true, dataAsset: true },
  });

  await createAuditLog({
    userId: user.id,
    entityId: itemId,
    entityType: "KnowledgeItem",
    action: "admin_force_approve",
    organizationId: existing.organizationId,
    oldValue: { status: existing.status },
    newValue: { status: "approved", reviewerId: user.id },
  });

  revalidatePath(`/assets/${existing.dataAssetId}`);
  return updated;
}

// ─── Verify Freshness ───────────────────────────────────────────

export async function verifyKnowledgeItem(itemId: string) {
  const user = await requireUser();

  const updated = await prisma.knowledgeItem.update({
    where: { id: itemId },
    data: { verifiedAt: new Date() },
  });

  await createAuditLog({
    userId: user.id,
    entityId: itemId,
    entityType: "KnowledgeItem",
    action: "verify_freshness",
    newValue: { verifiedAt: updated.verifiedAt },
  });

  return updated;
}

// ─── Fetch Pending Reviews ──────────────────────────────────────

export async function getPendingReviews(orgSlug?: string) {
  await requireUser();
  const orgFilter = orgSlug ? { organizationId: await resolveOrgId(orgSlug) } : {};
  return prisma.knowledgeItem.findMany({
    where: { status: "review", ...orgFilter },
    include: {
      author: true,
      dataAsset: {
        select: {
          id: true,
          systemName: true,
          schemaName: true,
          tableName: true,
          columnName: true,
          hebrewName: true,
          assetType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type PendingReviewItem = Awaited<
  ReturnType<typeof getPendingReviews>
>[number];
