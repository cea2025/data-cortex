"use server";

import { prisma } from "@/lib/prisma";
import { resolveOrgId } from "@/lib/org";

export interface TopContributor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  count: number;
}

export interface RecentKnowledgeItem {
  id: string;
  title: string;
  itemType: string;
  createdAt: Date;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  dataAsset: {
    id: string;
    assetType: string;
    systemName: string;
    tableName: string | null;
    columnName: string | null;
  };
}

export interface DashboardStats {
  totalTables: number;
  totalColumns: number;
  totalKnowledgeItems: number;
  documentedAssetsCount: number;
  coveragePercentage: number;
  topContributors: TopContributor[];
  recentKnowledge: RecentKnowledgeItem[];
  systemBreakdown: { systemName: string; tableCount: number }[];
}

export async function getDashboardStats(
  orgSlug: string
): Promise<DashboardStats> {
  const organizationId = await resolveOrgId(orgSlug);

  const [
    totalTables,
    totalColumns,
    totalKnowledgeItems,
    documentedAssets,
    recentKnowledge,
    systemBreakdown,
  ] = await Promise.all([
    prisma.dataAsset.count({
      where: { organizationId, assetType: "table" },
    }),

    prisma.dataAsset.count({
      where: { organizationId, assetType: "column" },
    }),

    prisma.knowledgeItem.count({
      where: { organizationId, status: "approved" },
    }),

    prisma.knowledgeItem.findMany({
      where: { organizationId, status: "approved" },
      select: { dataAssetId: true },
      distinct: ["dataAssetId"],
    }),

    prisma.knowledgeItem.findMany({
      where: { organizationId, status: "approved" },
      include: {
        author: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        dataAsset: {
          select: {
            id: true,
            assetType: true,
            systemName: true,
            tableName: true,
            columnName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.dataAsset.groupBy({
      by: ["systemName"],
      where: { organizationId, assetType: "table" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  const documentedAssetsCount = documentedAssets.length;
  const totalAssetsForCoverage = totalTables + totalColumns;
  const coveragePercentage =
    totalAssetsForCoverage > 0
      ? Math.round((documentedAssetsCount / totalAssetsForCoverage) * 10000) /
        100
      : 0;

  // Top contributors: group approved knowledge items by author
  const contributorAggregation = await prisma.knowledgeItem.groupBy({
    by: ["authorId"],
    where: { organizationId, status: "approved" },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  let topContributors: TopContributor[] = [];
  if (contributorAggregation.length > 0) {
    const authorIds = contributorAggregation.map((c) => c.authorId);
    const authors = await prisma.userProfile.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, displayName: true, avatarUrl: true },
    });

    const authorMap = new Map(authors.map((a) => [a.id, a]));
    topContributors = contributorAggregation.map((c) => {
      const author = authorMap.get(c.authorId);
      return {
        id: c.authorId,
        displayName: author?.displayName ?? "Unknown",
        avatarUrl: author?.avatarUrl ?? null,
        count: c._count.id,
      };
    });
  }

  return {
    totalTables,
    totalColumns,
    totalKnowledgeItems,
    documentedAssetsCount,
    coveragePercentage,
    topContributors,
    recentKnowledge,
    systemBreakdown: systemBreakdown.map((s) => ({
      systemName: s.systemName,
      tableCount: s._count.id,
    })),
  };
}
