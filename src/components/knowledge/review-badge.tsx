import { Badge } from "@/components/ui/badge";
import { KNOWLEDGE_STATUS_LABELS } from "@/types/domain";
import type { KnowledgeStatus } from "@/types/domain";
import { cn } from "@/lib/utils";
import styles from "./ReviewBadge.module.css";

const statusVariants: Record<string, string> = {
  draft: styles.draft,
  review: styles.review,
  approved: styles.approved,
  rejected: styles.rejected,
};

function ReviewBadge({ status }: { status: string }) {
  return (
    <Badge className={cn(styles.badge, statusVariants[status] ?? styles.draft)}>
      {KNOWLEDGE_STATUS_LABELS[status as KnowledgeStatus] ?? status}
    </Badge>
  );
}

export default ReviewBadge;
