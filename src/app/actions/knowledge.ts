"use server";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import type { KnowledgeItemType } from "@/generated/prisma/client";

interface CreateKnowledgeParams {
  dataAssetId: string;
  authorId: string;
  title: string;
  itemType: KnowledgeItemType;
  contentHebrew?: string;
  contentEnglish?: string;
}

export async function createKnowledgeItem(params: CreateKnowledgeParams) {
  const item = await prisma.knowledgeItem.create({
    data: {
      dataAssetId: params.dataAssetId,
      authorId: params.authorId,
      title: params.title,
      itemType: params.itemType,
      contentHebrew: params.contentHebrew,
      contentEnglish: params.contentEnglish,
      status: "draft",
      sourceProvenance: {
        addedBy: params.authorId,
        source: "Manual Documentation",
      },
    },
    include: { author: true },
  });

  await createAuditLog({
    userId: params.authorId,
    entityId: item.id,
    entityType: "KnowledgeItem",
    action: "create",
    newValue: { title: item.title, itemType: item.itemType },
  });

  // Notify the asset owner
  const asset = await prisma.dataAsset.findUnique({
    where: { id: params.dataAssetId },
    select: { ownerId: true, tableName: true, columnName: true },
  });

  if (asset?.ownerId && asset.ownerId !== params.authorId) {
    await prisma.notification.create({
      data: {
        userId: asset.ownerId,
        type: "review_request",
        title: "פריט ידע חדש לבדיקה",
        message: `${item.title} - נוסף ל-${asset.columnName ?? asset.tableName}`,
        link: `/assets/${params.dataAssetId}`,
      },
    });
  }

  return item;
}

export async function updateKnowledgeStatus(
  itemId: string,
  status: "review" | "approved" | "rejected",
  reviewerId: string
) {
  const existing = await prisma.knowledgeItem.findUnique({
    where: { id: itemId },
  });

  if (!existing) throw new Error("Knowledge item not found");

  const updated = await prisma.knowledgeItem.update({
    where: { id: itemId },
    data: {
      status,
      reviewerId,
      verifiedAt: status === "approved" ? new Date() : undefined,
    },
    include: { author: true, reviewer: true },
  });

  await createAuditLog({
    userId: reviewerId,
    entityId: itemId,
    entityType: "KnowledgeItem",
    action: `status_change_to_${status}`,
    oldValue: { status: existing.status },
    newValue: { status },
  });

  if (existing.authorId !== reviewerId) {
    await prisma.notification.create({
      data: {
        userId: existing.authorId,
        type: "status_change",
        title:
          status === "approved"
            ? "פריט הידע אושר"
            : status === "rejected"
              ? "פריט הידע נדחה"
              : "פריט הידע נשלח לבדיקה",
        message: `${existing.title}`,
        link: `/assets/${existing.dataAssetId}`,
      },
    });
  }

  return updated;
}

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
