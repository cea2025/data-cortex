import { Clock, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getFreshnessLevel,
  getFreshnessColor,
  getFreshnessLabel,
  getDaysSinceVerification,
  type FreshnessLevel,
} from "@/lib/utils/freshness";
import { cn } from "@/lib/utils";

interface FreshnessIndicatorProps {
  verifiedAt: string | null;
  updatedAt: string;
}

const freshnessIcons: Record<FreshnessLevel, typeof Clock> = {
  fresh: ShieldCheck,
  aging: Clock,
  stale: ShieldQuestion,
  unverified: ShieldAlert,
};

export function FreshnessIndicator({
  verifiedAt,
  updatedAt,
}: FreshnessIndicatorProps) {
  const level = getFreshnessLevel(verifiedAt, updatedAt);
  const color = getFreshnessColor(level);
  const label = getFreshnessLabel(level);
  const days = getDaysSinceVerification(verifiedAt, updatedAt);
  const Icon = freshnessIcons[level];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5",
            level === "unverified" && "bg-destructive/10",
            level === "stale" && "bg-orange-500/10",
            level === "aging" && "bg-warning/10",
            level === "fresh" && "bg-success/10",
            color
          )}
        >
          <Icon className="h-3 w-3" />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent dir="rtl" className="max-w-60">
        <p>
          {verifiedAt ? "אומת לפני" : "עודכן לפני"} {days} ימים
        </p>
        {level === "unverified" && (
          <p className="text-destructive text-xs mt-1">
            לא אומת מעל 12 חודשים — נדרש אימות חוזר
          </p>
        )}
        {level === "stale" && (
          <p className="text-orange-500 text-xs mt-1">
            המידע מתיישן — מומלץ לאמת מחדש
          </p>
        )}
        {!verifiedAt && level !== "unverified" && (
          <p className="text-muted-foreground text-xs mt-1">
            טרם אומת על ידי בעלים
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
