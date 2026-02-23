"use server";

import { prisma } from "@/lib/prisma";
import { resolveOrgId } from "@/lib/org";
import { requireUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import type { AssetRelationshipWithDetails } from "@/types/domain";

interface AddRelationshipInput {
  sourceId: string;
  targetId: string;
  type: string;
  description?: string;
  orgSlug: string;
}

export async function addAssetRelationship(data: AddRelationshipInput) {
  const user = await requireUser();
  const organizationId = await resolveOrgId(data.orgSlug);

  const relationship = await prisma.assetRelationship.create({
    data: {
      sourceAssetId: data.sourceId,
      targetAssetId: data.targetId,
      relationshipType: data.type,
      description: data.description || null,
      authorId: user.id,
      organizationId,
    },
    include: {
      sourceAsset: {
        select: { id: true, assetType: true, systemName: true, tableName: true, columnName: true },
      },
      targetAsset: {
        select: { id: true, assetType: true, systemName: true, tableName: true, columnName: true },
      },
      author: true,
    },
  });

  await createAuditLog({
    userId: user.id,
    entityId: relationship.id,
    entityType: "AssetRelationship",
    action: "create",
    organizationId,
    newValue: {
      sourceAssetId: data.sourceId,
      targetAssetId: data.targetId,
      relationshipType: data.type,
      description: data.description ?? null,
    },
  });

  return relationship;
}

export async function deleteAssetRelationship(id: string, orgSlug: string) {
  const user = await requireUser();
  const organizationId = await resolveOrgId(orgSlug);

  const existing = await prisma.assetRelationship.findFirst({
    where: { id, organizationId },
  });
  if (!existing) throw new Error("Relationship not found");

  await prisma.assetRelationship.delete({ where: { id } });

  await createAuditLog({
    userId: user.id,
    entityId: id,
    entityType: "AssetRelationship",
    action: "delete",
    organizationId,
    oldValue: {
      sourceAssetId: existing.sourceAssetId,
      targetAssetId: existing.targetAssetId,
      relationshipType: existing.relationshipType,
    },
  });
}

const assetSelect = {
  id: true,
  assetType: true,
  systemName: true,
  tableName: true,
  columnName: true,
} as const;

export async function getAssetRelationships(
  assetId: string,
  orgSlug: string
): Promise<{
  outgoing: AssetRelationshipWithDetails[];
  incoming: AssetRelationshipWithDetails[];
}> {
  await requireUser();
  const organizationId = await resolveOrgId(orgSlug);

  const [outgoing, incoming] = await Promise.all([
    prisma.assetRelationship.findMany({
      where: { sourceAssetId: assetId, organizationId },
      include: {
        sourceAsset: { select: assetSelect },
        targetAsset: { select: assetSelect },
        author: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.assetRelationship.findMany({
      where: { targetAssetId: assetId, organizationId },
      include: {
        sourceAsset: { select: assetSelect },
        targetAsset: { select: assetSelect },
        author: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serialize = (items: typeof outgoing): AssetRelationshipWithDetails[] =>
    items.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      relationshipType: r.relationshipType as AssetRelationshipWithDetails["relationshipType"],
      sourceAsset: { ...r.sourceAsset, assetType: r.sourceAsset.assetType as AssetRelationshipWithDetails["sourceAsset"]["assetType"] },
      targetAsset: { ...r.targetAsset, assetType: r.targetAsset.assetType as AssetRelationshipWithDetails["targetAsset"]["assetType"] },
      author: {
        ...r.author,
        role: r.author.role as AssetRelationshipWithDetails["author"]["role"],
        createdAt: undefined as never,
        updatedAt: undefined as never,
      },
    }));

  return {
    outgoing: serialize(outgoing),
    incoming: serialize(incoming),
  };
}

export async function searchAssetsForRelationship(
  query: string,
  orgSlug: string,
  excludeId?: string
) {
  await requireUser();
  if (!query || query.length < 2) return [];

  const organizationId = await resolveOrgId(orgSlug);
  const term = query.trim();

  const assets = await prisma.dataAsset.findMany({
    where: {
      organizationId,
      assetType: { in: ["table", "column"] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [
        { tableName: { contains: term, mode: "insensitive" } },
        { columnName: { contains: term, mode: "insensitive" } },
        { hebrewName: { contains: term, mode: "insensitive" } },
        { systemName: { contains: term, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      assetType: true,
      systemName: true,
      tableName: true,
      columnName: true,
      hebrewName: true,
    },
    take: 20,
    orderBy: { updatedAt: "desc" },
  });

  return assets.map((a) => ({
    id: a.id,
    assetType: a.assetType as string,
    label: a.columnName ?? a.tableName ?? a.systemName,
    path: [a.systemName, a.tableName, a.columnName].filter(Boolean).join(" / "),
    hebrewName: a.hebrewName,
  }));
}
