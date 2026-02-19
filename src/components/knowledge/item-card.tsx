"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReviewBadge } from "./review-badge";
import { ProvenanceTag } from "@/components/audit/provenance-tag";
import { FreshnessIndicator } from "@/components/audit/freshness-indicator";
import { KNOWLEDGE_TYPE_LABELS } from "@/types/domain";
import type { KnowledgeItemType } from "@/types/domain";
import { Badge } from "@/components/ui/badge";

interface KnowledgeItemProps {
  item: {
    id: string;
    itemType: string;
    status: string;
    title: string;
    contentHebrew: string | null;
    contentEnglish: string | null;
    sourceProvenance: unknown;
    verifiedAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    author: { displayName: string; email: string };
    reviewer?: { displayName: string } | null;
  };
}

export function KnowledgeItemCard({ item }: KnowledgeItemProps) {
  return (
    <Card className="border-r-2 border-r-primary/30">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="text-xs shrink-0">
              {KNOWLEDGE_TYPE_LABELS[item.itemType as KnowledgeItemType]}
            </Badge>
            <ReviewBadge status={item.status} />
          </div>
          <FreshnessIndicator
            verifiedAt={
              item.verifiedAt
                ? typeof item.verifiedAt === "string"
                  ? item.verifiedAt
                  : item.verifiedAt.toISOString()
                : null
            }
            updatedAt={
              typeof item.updatedAt === "string"
                ? item.updatedAt
                : item.updatedAt.toISOString()
            }
          />
        </div>
        <h4 className="text-sm font-semibold mt-1">{item.title}</h4>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2">
        {item.contentHebrew && (
          <p className="text-sm leading-relaxed">{item.contentHebrew}</p>
        )}
        {item.contentEnglish && (
          <p className="text-xs text-muted-foreground leading-relaxed" dir="ltr">
            {item.contentEnglish}
          </p>
        )}
        <div className="pt-1">
          <ProvenanceTag
            provenance={item.sourceProvenance}
            author={item.author}
          />
        </div>
      </CardContent>
    </Card>
  );
}
