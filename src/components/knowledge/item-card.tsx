"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ReviewBadge from "./review-badge";
import ProvenanceTag from "@/components/audit/provenance-tag";
import FreshnessIndicator from "@/components/audit/freshness-indicator";
import { KNOWLEDGE_TYPE_LABELS } from "@/types/domain";
import type { KnowledgeItemType } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { ArrowBigUp, Crown, ShieldCheck, Loader2 } from "lucide-react";
import { upvoteKnowledgeItem } from "@/app/actions/rules";
import { forceApproveKnowledgeItem } from "@/app/actions/knowledge";
import { useUserRole } from "@/lib/org-context";
import { toast } from "sonner";
import styles from "./KnowledgeItemCard.module.css";

interface KnowledgeItemProps {
  item: {
    id: string;
    itemType: string;
    status: string;
    title: string;
    contentHebrew: string | null;
    contentEnglish: string | null;
    sourceProvenance: unknown;
    isCanonical?: boolean;
    upvotes?: number;
    verifiedAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    author: { displayName: string; email: string };
    reviewer?: { displayName: string } | null;
  };
}

function KnowledgeItemCard({ item }: KnowledgeItemProps) {
  const router = useRouter();
  const { isAdmin } = useUserRole();
  const [isPending, startTransition] = useTransition();

  const handleUpvote = () => {
    startTransition(async () => {
      await upvoteKnowledgeItem(item.id);
    });
  };

  const handleForceApprove = () => {
    startTransition(async () => {
      try {
        await forceApproveKnowledgeItem(item.id);
        toast.success("פריט אושר ישירות על ידי מנהל");
        router.refresh();
      } catch {
        toast.error("שגיאה באישור הפריט");
      }
    });
  };

  const showForceApprove = isAdmin && item.status !== "approved";

  const cardClass = item.isCanonical
    ? `${styles.card} ${styles.canonicalCard}`
    : styles.card;

  return (
    <Card className={cardClass}>
      <CardHeader className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.badgesRow}>
            <Badge variant="outline" className={styles.badge}>
              {KNOWLEDGE_TYPE_LABELS[item.itemType as KnowledgeItemType]}
            </Badge>
            <ReviewBadge status={item.status} />
            {item.isCanonical && (
              <Badge className={styles.canonicalBadge}>
                <Crown size={10} />
                <span className="body-tiny-bold" style={{ marginInlineStart: "2px" }}>הגדרה רשמית</span>
              </Badge>
            )}
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
        <h4 className={styles.title}>{item.title}</h4>
      </CardHeader>
      <CardContent className={styles.content}>
        {item.contentHebrew && (
          <div className={styles.markdown}>
            <Markdown>{item.contentHebrew}</Markdown>
          </div>
        )}
        {item.contentEnglish && (
          <div className={`${styles.markdown} ${styles.markdownLtr}`}>
            <Markdown>{item.contentEnglish}</Markdown>
          </div>
        )}
        <div className={styles.footer}>
          <ProvenanceTag
            provenance={item.sourceProvenance}
            author={item.author}
          />
          <div className="flex items-center gap-1.5">
            {showForceApprove && (
              <button
                className={`${styles.upvoteBtn} body-small-semibold`}
                onClick={handleForceApprove}
                disabled={isPending}
                title="אישור ישיר (מנהל)"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              </button>
            )}
            <button
              className={`${styles.upvoteBtn} body-small-semibold`}
              onClick={handleUpvote}
              disabled={isPending}
            >
              <ArrowBigUp size={14} />
              {item.upvotes ?? 0}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default KnowledgeItemCard;
