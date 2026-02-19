import { Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  getFreshnessLevel,
  getFreshnessColor,
  getFreshnessLabel,
  getDaysSinceVerification,
} from "@/lib/utils/freshness";
import { cn } from "@/lib/utils";

interface FreshnessIndicatorProps {
  verifiedAt: string | null;
  updatedAt: string;
}

export function FreshnessIndicator({
  verifiedAt,
  updatedAt,
}: FreshnessIndicatorProps) {
  const level = getFreshnessLevel(verifiedAt, updatedAt);
  const color = getFreshnessColor(level);
  const label = getFreshnessLabel(level);
  const days = getDaysSinceVerification(verifiedAt, updatedAt);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("flex items-center gap-1 text-xs", color)}>
          <Clock className="h-3 w-3" />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent dir="rtl">
        <p>
          {verifiedAt ? "אומת לפני" : "עודכן לפני"} {days} ימים
        </p>
        {level === "unverified" && (
          <p className="text-destructive text-xs mt-1">
            נדרש אימות חוזר מהבעלים
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
