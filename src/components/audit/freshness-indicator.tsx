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
import styles from "./FreshnessIndicator.module.css";

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
  fresh: styles.fresh,
  aging: styles.aging,
  stale: styles.stale,
  unverified: styles.unverified,
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
        <span className={cn(styles.trigger, levelStyles[level])}>
          <Icon className={styles.icon} />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent dir="rtl" className="max-w-60">
        <p>
          {verifiedAt ? "אומת לפני" : "עודכן לפני"} {days} ימים
        </p>
        {level === "unverified" && (
          <p className={styles.tooltipDestructive}>
            לא אומת מעל 12 חודשים — נדרש אימות חוזר
          </p>
        )}
        {level === "stale" && (
          <p className={styles.tooltipStale}>
            המידע מתיישן — מומלץ לאמת מחדש
          </p>
        )}
        {!verifiedAt && level !== "unverified" && (
          <p className={styles.tooltipMuted}>
            טרם אומת על ידי בעלים
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export default FreshnessIndicator;
