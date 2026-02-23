import { describe, it, expect } from "vitest";
import {
  resolveKnowledgeConflict,
  getColumnConflictStatus,
} from "@/lib/utils/conflict-resolver";

describe("resolveKnowledgeConflict", () => {
  it("returns empty when no items and no AI insight", () => {
    const result = resolveKnowledgeConflict([], [], null);
    expect(result.status).toBe("empty");
    expect(result.totalCount).toBe(0);
  });

  it("returns AI-only unverified when only AI insight exists", () => {
    const result = resolveKnowledgeConflict([], [], {
      id: "ai-1",
      confidenceScore: 0.85,
      synthesis: "Some synthesis",
    });
    expect(result.status).toBe("unverified");
    expect(result.winningSourceType).toBe("ai_draft");
    expect(result.label).toBe("AI בלבד");
  });

  it("returns verified when approved human items exist", () => {
    const result = resolveKnowledgeConflict(
      [
        {
          id: "ki-1",
          status: "approved",
          itemType: "business_rule",
          verifiedAt: new Date(),
          sourceProvenance: { source: "Manual Documentation" },
        },
      ],
      [],
      null
    );
    expect(result.status).toBe("verified");
    expect(result.winningSourceType).toBe("human_approved");
    expect(result.approvedCount).toBe(1);
  });

  it("returns unverified when only draft items exist", () => {
    const result = resolveKnowledgeConflict(
      [
        {
          id: "ki-1",
          status: "draft",
          itemType: "business_rule",
          sourceProvenance: { source: "Manual Documentation" },
        },
      ],
      [],
      null
    );
    expect(result.status).toBe("unverified");
    expect(result.approvedCount).toBe(0);
  });

  it("detects conflict when multiple sources disagree on business rules", () => {
    const result = resolveKnowledgeConflict(
      [
        {
          id: "ki-1",
          status: "approved",
          itemType: "business_rule",
          verifiedAt: new Date(),
          sourceProvenance: { source: "Manual Documentation" },
        },
      ],
      [
        {
          id: "ki-2",
          status: "draft",
          itemType: "business_rule",
          sourceProvenance: { source: "Integration API" },
        },
      ],
      null
    );
    expect(result.status).toBe("conflict");
    expect(result.winningSourceType).toBe("human_approved");
  });

  it("detects deprecation and warning flags", () => {
    const result = resolveKnowledgeConflict(
      [
        {
          id: "ki-1",
          status: "approved",
          itemType: "deprecation",
          verifiedAt: new Date(),
        },
        {
          id: "ki-2",
          status: "approved",
          itemType: "warning",
          verifiedAt: new Date(),
        },
      ],
      [],
      null
    );
    expect(result.hasDeprecation).toBe(true);
    expect(result.hasWarning).toBe(true);
  });
});

describe("getColumnConflictStatus", () => {
  it("separates human and integration items correctly", () => {
    const items = [
      {
        id: "ki-1",
        status: "approved",
        itemType: "business_rule",
        verifiedAt: new Date(),
        sourceProvenance: { source: "Manual Documentation" },
      },
      {
        id: "ki-2",
        status: "draft",
        itemType: "business_rule",
        sourceProvenance: { source: "External ETL" },
      },
    ];
    const result = getColumnConflictStatus(items, null);
    expect(result.status).toBe("conflict");
    expect(result.totalCount).toBe(2);
  });
});
