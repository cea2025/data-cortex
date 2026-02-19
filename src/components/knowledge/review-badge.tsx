import { Badge } from "@/components/ui/badge";
import { KNOWLEDGE_STATUS_LABELS } from "@/types/domain";
import type { KnowledgeStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const statusVariants: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success",
  rejected: "bg-destructive/20 text-destructive",
};

export function ReviewBadge({ status }: { status: string }) {
  return (
    <Badge className={cn("text-xs", statusVariants[status])}>
      {KNOWLEDGE_STATUS_LABELS[status as KnowledgeStatus] ?? status}
    </Badge>
  );
}
