"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Cpu,
  ExternalLink,
  RefreshCw,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { regenerateInsight } from "@/app/actions/ai";
import { toast } from "sonner";
import type { AssetWithKnowledge } from "@/app/actions/assets";
import { useOrgSlug } from "@/lib/org-context";

type AIInsight = AssetWithKnowledge["aiInsights"][number];

interface AIEvidencePanelProps {
  insights: AIInsight[];
  assetId: string;
  hasApprovedKnowledge: boolean;
}

export function AIEvidencePanel({
  insights,
  assetId,
  hasApprovedKnowledge,
}: AIEvidencePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRegenerate = () => {
    startTransition(async () => {
      try {
        await regenerateInsight(assetId);
        toast.success("תובנת AI חדשה נוצרה בהצלחה");
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "שגיאה ביצירת תובנה";
        toast.error(message);
      }
    });
  };

  if (insights.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>אין תובנות AI עדיין</p>
          <p className="text-xs mt-1">
            {hasApprovedKnowledge
              ? "לחץ למטה כדי ליצור תובנה מבוססת על הידע המאושר"
              : "תובנות AI ייווצרו כשיהיו פריטי ידע מאושרים"}
          </p>
        </div>
        {hasApprovedKnowledge && (
          <Button
            variant="outline"
            className="w-full gap-2 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-950/30"
            onClick={handleRegenerate}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isPending ? "מייצר תובנה..." : "צור תובנת AI"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}

      {hasApprovedKnowledge && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-950/30"
          onClick={handleRegenerate}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isPending ? "מחשב מחדש..." : "חשב מחדש תובנה"}
        </Button>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const orgSlug = useOrgSlug();
  const pct = Math.round(insight.confidenceScore * 100);
  const confidenceLevel =
    pct >= 80 ? "high" : pct >= 50 ? "medium" : "low";

  const confidenceConfig = {
    high: {
      icon: ShieldCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      progressClass: "[&>[data-slot=progress-indicator]]:bg-emerald-500",
      bgClass: "bg-emerald-500/10",
      label: "ביטחון גבוה",
    },
    medium: {
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      progressClass: "[&>[data-slot=progress-indicator]]:bg-amber-500",
      bgClass: "bg-amber-500/10",
      label: "ביטחון בינוני",
    },
    low: {
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      progressClass: "[&>[data-slot=progress-indicator]]:bg-red-500",
      bgClass: "bg-red-500/10",
      label: "ביטחון נמוך",
    },
  }[confidenceLevel];

  const ConfIcon = confidenceConfig.icon;

  return (
    <Card className="border-r-2 border-r-violet-400 bg-gradient-to-l from-violet-50/30 to-transparent dark:from-violet-950/10">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400">
              <Cpu className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-sm">תובנת AI</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]" dir="ltr">
              {insight.modelVersion}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 space-y-3">
        {/* Synthesis */}
        <p className="text-sm leading-relaxed">{insight.synthesis}</p>

        {/* Confidence Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ConfIcon className={`h-3 w-3 ${confidenceConfig.color}`} />
              {confidenceConfig.label}
            </span>
            <span className={`text-xs font-mono font-semibold ${confidenceConfig.color}`}>
              {pct}%
            </span>
          </div>
          <Progress
            value={pct}
            className={`h-1.5 ${confidenceConfig.progressClass}`}
          />
        </div>

        {/* Source Citations */}
        {insight.sourceReferences.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">
              מבוסס על {insight.sourceReferences.length} מקורות:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {insight.sourceReferences.map((ref, idx) => (
                <Tooltip key={`${ref.knowledgeItem.id}-${idx}`}>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/${orgSlug}/assets/${ref.knowledgeItem.dataAssetId}`}
                      className="inline-flex items-center gap-1 text-xs bg-violet-100/60 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-md px-2 py-1 hover:bg-violet-200/80 dark:hover:bg-violet-900/50 transition-colors"
                    >
                      <span className="font-mono font-semibold">
                        [{idx + 1}]
                      </span>
                      <span className="truncate max-w-28">
                        {ref.knowledgeItem.title}
                      </span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent dir="rtl" className="max-w-60">
                    <p className="font-medium">{ref.knowledgeItem.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ref.knowledgeItem.author.displayName}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground/60" dir="ltr">
          Generated{" "}
          {new Date(insight.createdAt).toLocaleDateString("he-IL", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
