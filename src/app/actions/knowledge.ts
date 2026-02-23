"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import type { KnowledgeItemType } from "@/generated/prisma/client";

// ─── Submit Draft (status → "review") ───────────────────────────

interface SubmitDraftParams {
  dataAssetId: string;
  authorId: string;
  title: string;
  itemType: KnowledgeItemType;
  contentHebrew?: string;
  contentEnglish?: string;
}

export async function submitKnowledgeDraft(params: SubmitDraftParams) {
  const item = await prisma.knowledgeItem.create({
    data: {
      dataAssetId: params.dataAssetId,
      authorId: params.authorId,
      title: params.title,
      itemType: params.itemType,
      contentHebrew: params.contentHebrew,
      contentEnglish: params.contentEnglish,
      status: "review",
      sourceProvenance: {
        addedBy: params.authorId,
        source: "Manual Documentation",
      },
    },
    include: { author: true, dataAsset: true },
  });

  await createAuditLog({
    userId: params.authorId,
    entityId: item.id,
    entityType: "KnowledgeItem",
    action: "submit_draft",
    newValue: {
      title: item.title,
      itemType: item.itemType,
      status: "review",
      dataAssetId: item.dataAssetId,
    },
  });

  if (item.dataAsset.ownerId && item.dataAsset.ownerId !== params.authorId) {
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

  return item;
}

// ─── Update Status (approve / reject / review) ─────────────────

export async function updateKnowledgeStatus(
  itemId: string,
  newStatus: "approved" | "rejected",
  reviewerId: string
) {
  const existing = await prisma.knowledgeItem.findUnique({
    where: { id: itemId },
  });

  if (!existing) throw new Error("Knowledge item not found");

  const updated = await prisma.knowledgeItem.update({
    where: { id: itemId },
    data: {
      status: newStatus,
      reviewerId,
      verifiedAt: newStatus === "approved" ? new Date() : undefined,
    },
    include: { author: true, reviewer: true, dataAsset: true },
  });

  await createAuditLog({
    userId: reviewerId,
    entityId: itemId,
    entityType: "KnowledgeItem",
    action: `status_change_to_${newStatus}`,
    oldValue: { status: existing.status },
    newValue: { status: newStatus, reviewerId },
  });

  if (existing.authorId !== reviewerId) {
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

// ─── Verify Freshness ───────────────────────────────────────────

export async function verifyKnowledgeItem(itemId: string, userId: string) {
  const updated = await prisma.knowledgeItem.update({
    where: { id: itemId },
    data: { verifiedAt: new Date() },
  });

  await createAuditLog({
    userId,
    entityId: itemId,
    entityType: "KnowledgeItem",
    action: "verify_freshness",
    newValue: { verifiedAt: updated.verifiedAt },
  });

  return updated;
}

// ─── Fetch Pending Reviews ──────────────────────────────────────

export async function getPendingReviews() {
  return prisma.knowledgeItem.findMany({
    where: { status: "review" },
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
