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
    ? "border-r-2 border-r-teal-500 bg-teal-50/50 dark:bg-teal-950/20"
    : "border-r-2 border-r-transparent";

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-2 gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {KNOWLEDGE_TYPE_LABELS[item.itemType as KnowledgeItemType]}
            </Badge>
            <ReviewBadge status={item.status} />
            {item.isCanonical && (
              <Badge className="bg-teal-600 text-white hover:bg-teal-700 text-[10px] px-1.5 py-0">
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
        <h4 className="text-sm font-semibold leading-tight">{item.title}</h4>
      </CardHeader>
      <CardContent className="pt-0 pb-3 space-y-3">
        {item.contentHebrew && (
          <div className="prose prose-sm prose-rtl dark:prose-invert max-w-none prose-pre:bg-navy-950 prose-pre:text-teal-300 prose-code:text-teal-600">
            <Markdown>{item.contentHebrew}</Markdown>
          </div>
        )}
        {item.contentEnglish && (
          <div className="prose prose-sm prose-rtl prose-ltr dark:prose-invert max-w-none prose-pre:bg-navy-950 prose-pre:text-teal-300 prose-code:text-teal-600" dir="ltr">
            <Markdown>{item.contentEnglish}</Markdown>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <ProvenanceTag
            provenance={item.sourceProvenance}
            author={item.author}
          />
          <div className="flex items-center gap-1.5">
            {showForceApprove && (
              <button
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-sm hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300 transition-colors body-small-semibold"
                onClick={handleForceApprove}
                disabled={isPending}
                title="אישור ישיר (מנהל)"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              </button>
            )}
            <button
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-sm hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300 transition-colors body-small-semibold"
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
