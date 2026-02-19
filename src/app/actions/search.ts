"use server";

import { prisma } from "@/lib/prisma";

export async function searchAssets(query: string) {
  if (!query || query.length < 2) return [];

  const results = await prisma.dataAsset.findMany({
    where: {
      OR: [
        { systemName: { contains: query, mode: "insensitive" } },
        { schemaName: { contains: query, mode: "insensitive" } },
        { tableName: { contains: query, mode: "insensitive" } },
        { columnName: { contains: query, mode: "insensitive" } },
        { hebrewName: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      _count: { select: { knowledgeItems: true } },
    },
    take: 20,
    orderBy: { updatedAt: "desc" },
  });

  return results.map((r) => ({
    id: r.id,
    type: r.assetType,
    title:
      r.columnName ??
      r.tableName ??
      r.schemaName ??
      r.systemName,
    subtitle: [r.systemName, r.schemaName, r.tableName]
      .filter(Boolean)
      .join(" / "),
    hebrewName: r.hebrewName,
    dataType: r.dataType,
    knowledgeCount: r._count.knowledgeItems,
  }));
}
