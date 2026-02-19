"use server";

import { prisma } from "@/lib/prisma";

export async function getAssetById(id: string) {
  return prisma.dataAsset.findUnique({
    where: { id },
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

export async function getAssetTree() {
  const systems = await prisma.dataAsset.findMany({
    where: { assetType: "system" },
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

export async function getTableAssets() {
  return prisma.dataAsset.findMany({
    where: { assetType: "table" },
    include: {
      owner: true,
      _count: {
        select: { knowledgeItems: true, children: true },
      },
    },
    orderBy: { tableName: "asc" },
  });
}
