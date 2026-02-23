"use server";

import { prisma } from "@/lib/prisma";
import type { AssetType, KnowledgeItemType } from "@/types/domain";

export interface AssetSearchResult {
  id: string;
  type: AssetType;
  title: string;
  subtitle: string;
  hebrewName: string | null;
  dataType: string | null;
  knowledgeCount: number;
}

export interface KnowledgeSearchResult {
  id: string;
  type: "knowledge";
  knowledgeType: KnowledgeItemType;
  title: string;
  snippet: string;
  assetId: string;
  assetPath: string;
}

export type SearchResult = AssetSearchResult | KnowledgeSearchResult;

export async function searchAssetsAndKnowledge(
  query: string
): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const term = query.trim();

  const [assets, knowledgeItems] = await Promise.all([
    prisma.dataAsset.findMany({
      where: {
        OR: [
          { systemName: { contains: term, mode: "insensitive" } },
          { schemaName: { contains: term, mode: "insensitive" } },
          { tableName: { contains: term, mode: "insensitive" } },
          { columnName: { contains: term, mode: "insensitive" } },
          { hebrewName: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
        ],
      },
      include: {
        _count: { select: { knowledgeItems: true } },
      },
      take: 15,
      orderBy: { updatedAt: "desc" },
    }),

    prisma.knowledgeItem.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { contentHebrew: { contains: term, mode: "insensitive" } },
          { contentEnglish: { contains: term, mode: "insensitive" } },
        ],
      },
      include: {
        dataAsset: {
          select: {
            id: true,
            systemName: true,
            schemaName: true,
            tableName: true,
            columnName: true,
          },
        },
      },
      take: 10,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const assetResults: AssetSearchResult[] = assets.map((a) => ({
    id: a.id,
    type: a.assetType as AssetType,
    title:
      a.columnName ?? a.tableName ?? a.schemaName ?? a.systemName,
    subtitle: [a.systemName, a.schemaName, a.tableName]
      .filter(Boolean)
      .join(" / "),
    hebrewName: a.hebrewName,
    dataType: a.dataType,
    knowledgeCount: a._count.knowledgeItems,
  }));

  const knowledgeResults: KnowledgeSearchResult[] = knowledgeItems.map((k) => {
    const content = k.contentHebrew ?? k.contentEnglish ?? "";
    const snippet = extractSnippet(content, term, 80);
    const da = k.dataAsset;
    const assetPath = [da.systemName, da.schemaName, da.tableName, da.columnName]
      .filter(Boolean)
      .join(" / ");

    return {
      id: k.id,
      type: "knowledge" as const,
      knowledgeType: k.itemType as KnowledgeItemType,
      title: k.title,
      snippet,
      assetId: da.id,
      assetPath,
    };
  });

  return [...assetResults, ...knowledgeResults];
}

function extractSnippet(text: string, term: string, radius: number): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(term.toLowerCase());
  if (idx === -1) return text.slice(0, radius * 2) + (text.length > radius * 2 ? "…" : "");

  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + term.length + radius);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "…" + snippet;
  if (end < text.length) snippet = snippet + "…";
  return snippet;
}
