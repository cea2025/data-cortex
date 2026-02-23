import { Clock, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getFreshnessLevel,
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

const levelStyles: Record<FreshnessLevel, string> = {
  fresh: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  aging: "bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400",
  stale: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  unverified: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function FreshnessIndicator({
  verifiedAt,
  updatedAt,
}: FreshnessIndicatorProps) {
  const level = getFreshnessLevel(verifiedAt, updatedAt);
  const label = getFreshnessLabel(level);
  const days = getDaysSinceVerification(verifiedAt, updatedAt);
  const Icon = freshnessIcons[level];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5",
            levelStyles[level]
          )}
        >
          <Icon className="w-3 h-3" />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent dir="rtl" className="max-w-60">
        <p>
          {verifiedAt ? "אומת לפני" : "עודכן לפני"} {days} ימים
        </p>
        {level === "unverified" && (
          <p className="text-red-500 text-xs mt-1">
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

export default FreshnessIndicator;
