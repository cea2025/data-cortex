const FRESHNESS_THRESHOLD_MS = 12 * 30 * 24 * 60 * 60 * 1000; // ~12 months

export type FreshnessLevel = "fresh" | "aging" | "stale" | "unverified";

export function getFreshnessLevel(
  verifiedAt: string | null | undefined,
  updatedAt: string
): FreshnessLevel {
  const referenceDate = verifiedAt ?? updatedAt;
  const age = Date.now() - new Date(referenceDate).getTime();

  if (age < FRESHNESS_THRESHOLD_MS * 0.5) return "fresh";
  if (age < FRESHNESS_THRESHOLD_MS * 0.75) return "aging";
  if (age < FRESHNESS_THRESHOLD_MS) return "stale";
  return "unverified";
}

export function getFreshnessColor(level: FreshnessLevel): string {
  switch (level) {
    case "fresh":
      return "text-success";
    case "aging":
      return "text-warning";
    case "stale":
      return "text-orange-500";
    case "unverified":
      return "text-destructive";
  }
}

export function getFreshnessLabel(level: FreshnessLevel): string {
  switch (level) {
    case "fresh":
      return "עדכני";
    case "aging":
      return "מתיישן";
    case "stale":
      return "מיושן";
    case "unverified":
      return "לא מאומת";
  }
}

export function getDaysSinceVerification(
  verifiedAt: string | null | undefined,
  updatedAt: string
): number {
  const referenceDate = verifiedAt ?? updatedAt;
  return Math.floor(
    (Date.now() - new Date(referenceDate).getTime()) / (24 * 60 * 60 * 1000)
  );
}
