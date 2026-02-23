import { Badge } from "@/components/ui/badge";
import { KNOWLEDGE_STATUS_LABELS } from "@/types/domain";
import type { KnowledgeStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const statusVariants: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  review: "bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400",
  approved: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function ReviewBadge({ status }: { status: string }) {
  return (
    <Badge
      className={cn(
        "text-[10px] px-1.5 py-0 border-0",
        statusVariants[status] ?? statusVariants.draft
      )}
    >
      {KNOWLEDGE_STATUS_LABELS[status as KnowledgeStatus] ?? status}
    </Badge>
  );
}

export default ReviewBadge;
