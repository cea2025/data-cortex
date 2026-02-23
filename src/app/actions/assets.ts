"use server";

import { prisma } from "@/lib/prisma";
import { resolveOrgId } from "@/lib/org";

export async function getAssetById(id: string, orgSlug?: string) {
  const orgFilter = orgSlug ? { organizationId: await resolveOrgId(orgSlug) } : {};
  return prisma.dataAsset.findFirst({
    where: { id, ...orgFilter },
    include: {
      owner: true,
      parent: true,
      children: {
        orderBy: { columnName: "asc" },
      },
      knowledgeItems: {
        include: {
          author: true,
          reviewer: true,
        },
        orderBy: { createdAt: "desc" },
      },
      aiInsights: {
        include: {
          sourceReferences: {
            include: {
              knowledgeItem: {
                include: { author: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAssetWithKnowledge(id: string, orgSlug?: string) {
  const orgFilter = orgSlug ? { organizationId: await resolveOrgId(orgSlug) } : {};
  const asset = await prisma.dataAsset.findFirst({
    where: { id, ...orgFilter },
    include: {
      owner: true,
      parent: true,
      children: {
        include: {
          _count: { select: { knowledgeItems: true } },
        },
        orderBy: { columnName: "asc" },
      },
      knowledgeItems: {
        include: {
          author: true,
          reviewer: true,
        },
        orderBy: { createdAt: "desc" },
      },
      aiInsights: {
        include: {
          sourceReferences: {
            include: {
              knowledgeItem: {
                include: { author: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!asset) return null;

  if (asset.assetType === "table" && asset.children.length > 0) {
    const childIds = asset.children.map((c) => c.id);
    const childKnowledge = await prisma.knowledgeItem.findMany({
      where: { dataAssetId: { in: childIds } },
      include: {
        author: true,
        reviewer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      ...asset,
      childKnowledgeItems: childKnowledge,
    };
  }

  return { ...asset, childKnowledgeItems: [] as typeof asset.knowledgeItems };
}

export type AssetWithKnowledge = NonNullable<
  Awaited<ReturnType<typeof getAssetWithKnowledge>>
>;

export async function getAssetTree(orgSlug?: string) {
  const orgFilter = orgSlug ? { organizationId: await resolveOrgId(orgSlug) } : {};
  const systems = await prisma.dataAsset.findMany({
    where: { assetType: "system", ...orgFilter },
    include: {
      children: {
        where: { assetType: "schema" },
        include: {
          children: {
            where: { assetType: "table" },
            include: {
              _count: { select: { knowledgeItems: true, children: true } },
            },
            orderBy: { tableName: "asc" },
          },
        },
        orderBy: { schemaName: "asc" },
      },
    },
    orderBy: { systemName: "asc" },
  });

  return systems;
}

export async function getTableAssets(orgSlug?: string) {
  const orgFilter = orgSlug ? { organizationId: await resolveOrgId(orgSlug) } : {};
  return prisma.dataAsset.findMany({
    where: { assetType: "table", ...orgFilter },
    include: {
      owner: true,
      children: {
        where: { assetType: "column" },
        select: { id: true, columnName: true, hebrewName: true },
        orderBy: { columnName: "asc" },
      },
      _count: {
        select: { knowledgeItems: true, children: true },
      },
    },
    orderBy: { tableName: "asc" },
  });
}
