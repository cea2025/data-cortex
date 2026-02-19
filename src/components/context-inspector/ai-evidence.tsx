"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { getAssetById } from "@/app/actions/assets";

type Asset = NonNullable<Awaited<ReturnType<typeof getAssetById>>>;
type AIInsight = Asset["aiInsights"][number];

export function AIEvidencePanel({ insights }: { insights: AIInsight[] }) {
  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>אין תובנות AI עדיין</p>
        <p className="text-xs mt-1">
          תובנות AI ייווצרו אוטומטית כשיהיו מספיק פריטי ידע
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card key={insight.id} className="border-r-2 border-r-primary">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">תובנת AI</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadge score={insight.confidenceScore} />
                <Badge variant="outline" className="text-xs" dir="ltr">
                  {insight.modelVersion}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-3">
            <p className="text-sm leading-relaxed">{insight.synthesis}</p>

            {/* Clickable Citations */}
            {insight.sourceReferences.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  מבוסס על:
                </p>
                <div className="space-y-1">
                  {insight.sourceReferences.map((ref, idx) => (
                    <Link
                      key={`${ref.knowledgeItem.id}-${idx}`}
                      href={`/assets/${ref.knowledgeItem.dataAssetId}`}
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <span className="bg-primary/10 rounded px-1.5 py-0.5 font-mono">
                        [{idx + 1}]
                      </span>
                      <span className="truncate">
                        {ref.knowledgeItem.title}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const variant =
    pct >= 80 ? "text-success" : pct >= 60 ? "text-warning" : "text-destructive";

  return (
    <span className={`text-xs font-mono ${variant}`}>
      {pct}%
    </span>
  );
}
