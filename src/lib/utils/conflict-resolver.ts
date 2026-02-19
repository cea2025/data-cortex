import type { KnowledgeStatus } from "@/types/domain";

/**
 * ADR 4: Source Weighting Strategy
 * 1. Human "Approved" Knowledge ALWAYS overrides integration data
 * 2. Integration data overrides AI "Draft" data
 * 3. Conflicts generate a "Review Task" for the Table Owner
 */

export type SourceType = "human" | "integration" | "ai";

interface ConflictCandidate {
  id: string;
  sourceType: SourceType;
  status: KnowledgeStatus;
  content: string;
  confidence?: number;
}

interface ResolutionResult {
  winner: ConflictCandidate;
  losers: ConflictCandidate[];
  requiresReview: boolean;
  reason: string;
}

const SOURCE_PRIORITY: Record<SourceType, number> = {
  human: 3,
  integration: 2,
  ai: 1,
};

const STATUS_PRIORITY: Record<KnowledgeStatus, number> = {
  approved: 4,
  review: 3,
  draft: 2,
  rejected: 1,
};

export function resolveConflict(
  candidates: ConflictCandidate[]
): ResolutionResult {
  if (candidates.length < 2) {
    return {
      winner: candidates[0],
      losers: [],
      requiresReview: false,
      reason: "אין קונפליקט - מקור יחיד",
    };
  }

  const sorted = [...candidates].sort((a, b) => {
    const sourceDiff =
      SOURCE_PRIORITY[b.sourceType] - SOURCE_PRIORITY[a.sourceType];
    if (sourceDiff !== 0) return sourceDiff;

    const statusDiff =
      STATUS_PRIORITY[b.status] - STATUS_PRIORITY[a.status];
    if (statusDiff !== 0) return statusDiff;

    return (b.confidence ?? 0) - (a.confidence ?? 0);
  });

  const winner = sorted[0];
  const losers = sorted.slice(1);

  const hasHumanApproved =
    winner.sourceType === "human" && winner.status === "approved";
  const hasConflictingSources =
    new Set(candidates.map((c) => c.sourceType)).size > 1;

  return {
    winner,
    losers,
    requiresReview: hasConflictingSources && !hasHumanApproved,
    reason: hasHumanApproved
      ? "ידע אנושי מאושר גובר"
      : hasConflictingSources
        ? "קונפליקט בין מקורות - נדרשת סקירת בעלים"
        : `${winner.sourceType} נבחר לפי עדיפות`,
  };
}
