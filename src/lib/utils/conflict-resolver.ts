/**
 * ADR 4: Source Weighting for Knowledge Conflict Resolution
 *
 * Priority hierarchy:
 *   1. Human Approved  (weight 100)
 *   2. Integration      (weight 60)
 *   3. AI Draft / Human Draft (weight 20)
 *
 * A "conflict" exists when multiple knowledge items about the same asset
 * contain contradictory or incompatible statements.
 */

export type ConflictStatus = "verified" | "conflict" | "unverified" | "empty";

export interface ConflictResult {
  status: ConflictStatus;
  label: string;
  winningSourceType?: "human_approved" | "integration" | "ai_draft";
  hasDeprecation: boolean;
  hasWarning: boolean;
  approvedCount: number;
  totalCount: number;
}

interface KnowledgeInput {
  id: string;
  status: string;
  itemType: string;
  verifiedAt?: Date | string | null;
  sourceProvenance?: unknown;
  updatedAt?: Date | string;
}

interface AIInsightInput {
  id: string;
  confidenceScore: number;
  synthesis: string;
}

const SOURCE_WEIGHTS = {
  human_approved: 100,
  integration: 60,
  ai_draft: 20,
} as const;

function classifySource(
  item: KnowledgeInput
): keyof typeof SOURCE_WEIGHTS {
  const prov = item.sourceProvenance as { source?: string } | null;
  if (item.status === "approved") return "human_approved";
  if (prov?.source && prov.source !== "Manual Documentation") return "integration";
  return "ai_draft";
}

export function resolveKnowledgeConflict(
  humanItems: KnowledgeInput[],
  integrationItems: KnowledgeInput[],
  aiInsight: AIInsightInput | null
): ConflictResult {
  const allItems = [...humanItems, ...integrationItems];

  if (allItems.length === 0 && !aiInsight) {
    return {
      status: "empty",
      label: "אין ידע",
      hasDeprecation: false,
      hasWarning: false,
      approvedCount: 0,
      totalCount: 0,
    };
  }

  const hasDeprecation = allItems.some((i) => i.itemType === "deprecation");
  const hasWarning = allItems.some((i) => i.itemType === "warning");
  const approvedCount = allItems.filter((i) => i.status === "approved").length;

  if (allItems.length === 0 && aiInsight) {
    return {
      status: "unverified",
      label: "AI בלבד",
      winningSourceType: "ai_draft",
      hasDeprecation: false,
      hasWarning: false,
      approvedCount: 0,
      totalCount: 0,
    };
  }

  const classified = allItems.map((item) => ({
    item,
    sourceType: classifySource(item),
    weight: SOURCE_WEIGHTS[classifySource(item)],
  }));

  const sourceTypes = new Set(classified.map((c) => c.sourceType));
  const hasMultipleSources = sourceTypes.size > 1;

  const businessRules = classified.filter(
    (c) => c.item.itemType === "business_rule"
  );
  const hasConflictingRules =
    businessRules.length > 1 &&
    businessRules.some((a) =>
      businessRules.some(
        (b) => a.item.id !== b.item.id && a.sourceType !== b.sourceType
      )
    );

  if (hasConflictingRules && hasMultipleSources) {
    const winner = classified.reduce((best, current) =>
      current.weight > best.weight ? current : best
    );

    return {
      status: "conflict",
      label: "קונפליקט ידע",
      winningSourceType: winner.sourceType,
      hasDeprecation,
      hasWarning,
      approvedCount,
      totalCount: allItems.length,
    };
  }

  if (approvedCount > 0) {
    return {
      status: "verified",
      label: "מאומת",
      winningSourceType: "human_approved",
      hasDeprecation,
      hasWarning,
      approvedCount,
      totalCount: allItems.length,
    };
  }

  return {
    status: "unverified",
    label: "ממתין לאימות",
    winningSourceType: classified[0]?.sourceType,
    hasDeprecation,
    hasWarning,
    approvedCount,
    totalCount: allItems.length,
  };
}

/**
 * Resolve conflict status for a single column/asset given its knowledge items
 * and the latest AI insight (if any).
 */
export function getColumnConflictStatus(
  knowledgeItems: KnowledgeInput[],
  aiInsight: AIInsightInput | null
): ConflictResult {
  const humanItems = knowledgeItems.filter((i) => {
    const prov = i.sourceProvenance as { source?: string } | null;
    return !prov?.source || prov.source === "Manual Documentation";
  });

  const integrationItems = knowledgeItems.filter((i) => {
    const prov = i.sourceProvenance as { source?: string } | null;
    return prov?.source && prov.source !== "Manual Documentation";
  });

  return resolveKnowledgeConflict(humanItems, integrationItems, aiInsight);
}
