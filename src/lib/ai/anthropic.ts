import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

const MODEL_VERSION = "claude-sonnet-4-20250514";

const synthesisSchema = z.object({
  synthesis: z
    .string()
    .describe("A concise Hebrew synthesis of the asset's role in the business logic"),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score between 0 and 1"),
  sourceKnowledgeIds: z
    .array(z.string())
    .describe("Array of knowledge item IDs that the synthesis is based on"),
});

export type SynthesisResult = z.infer<typeof synthesisSchema>;

export async function generateAssetSynthesis(assetId: string): Promise<{
  insight: { id: string; synthesis: string; confidenceScore: number };
  sourceIds: string[];
}> {
  const asset = await prisma.dataAsset.findUnique({
    where: { id: assetId },
    include: {
      parent: { select: { tableName: true, schemaName: true, systemName: true } },
      knowledgeItems: {
        where: { status: "approved" },
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!asset) throw new Error(`Asset ${assetId} not found`);

  const approvedItems = asset.knowledgeItems;
  if (approvedItems.length === 0) {
    throw new Error("No approved knowledge items to synthesize");
  }

  const assetPath = [
    asset.systemName,
    asset.schemaName,
    asset.tableName,
    asset.columnName,
  ]
    .filter(Boolean)
    .join(" > ");

  const knowledgeContext = approvedItems
    .map(
      (ki, i) =>
        `[${i + 1}] ID="${ki.id}" Type=${ki.itemType} Title="${ki.title}" ` +
        `Hebrew="${ki.contentHebrew ?? ""}" English="${ki.contentEnglish ?? ""}" ` +
        `Author=${ki.author.displayName} Status=${ki.status}`
    )
    .join("\n\n");

  const idMap = approvedItems.map((ki) => ki.id);

  const { object } = await generateObject({
    model: anthropic(MODEL_VERSION),
    schema: synthesisSchema,
    system: `You are a Senior Data Architect specializing in Core Banking systems.
Your task is to analyze a database asset's metadata along with human-provided knowledge items, and produce a synthesized summary of what this asset represents in the business domain.

Rules:
- Write the synthesis in Hebrew.
- The synthesis should be 2-4 sentences explaining the business meaning, not just restating the column/table name.
- If there are warnings or deprecations, mention them prominently.
- If knowledge items conflict, note the conflict and lean toward the most recently verified item.
- Reference which knowledge items you relied on by using their exact IDs in the sourceKnowledgeIds array.
- Be honest about your confidence: high (>0.8) only when multiple consistent approved items exist.`,
    prompt: `Asset Path: ${assetPath}
Asset Type: ${asset.assetType}
Data Type: ${asset.dataType ?? "N/A"}
Hebrew Name: ${asset.hebrewName ?? "N/A"}
Description: ${asset.description ?? "N/A"}

Approved Knowledge Items:
${knowledgeContext}

Available Knowledge Item IDs: ${JSON.stringify(idMap)}

Analyze this asset and its knowledge items. Return a structured synthesis.`,
  });

  await prisma.aIInsight.deleteMany({
    where: { dataAssetId: assetId },
  });

  const insight = await prisma.aIInsight.create({
    data: {
      dataAssetId: assetId,
      synthesis: object.synthesis,
      confidenceScore: object.confidenceScore,
      modelVersion: MODEL_VERSION,
      sourceReferences: {
        create: object.sourceKnowledgeIds
          .filter((id) => idMap.includes(id))
          .map((knowledgeItemId) => ({ knowledgeItemId })),
      },
    },
  });

  await createAuditLog({
    userId: "system",
    entityId: insight.id,
    entityType: "AIInsight",
    action: "generate_synthesis",
    newValue: {
      assetId,
      confidenceScore: object.confidenceScore,
      sourceCount: object.sourceKnowledgeIds.length,
      modelVersion: MODEL_VERSION,
    },
  });

  return {
    insight: {
      id: insight.id,
      synthesis: object.synthesis,
      confidenceScore: object.confidenceScore,
    },
    sourceIds: object.sourceKnowledgeIds,
  };
}
