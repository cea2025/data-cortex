"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LtrText } from "@/components/ltr-text";
import ReviewActions from "./review-actions";
import { KNOWLEDGE_TYPE_LABELS } from "@/types/domain";
import type { KnowledgeItemType } from "@/types/domain";
import type { PendingReviewItem } from "@/app/actions/knowledge";
import { useOrgSlug } from "@/lib/org-context";
import {
  ClipboardCheck,
  BookOpen,
  AlertTriangle,
  Ban,
  Calculator,
  User,
  Clock,
} from "lucide-react";
import styles from "./ReviewDashboard.module.css";

const typeIcons: Record<KnowledgeItemType, typeof BookOpen> = {
  business_rule: BookOpen,
  warning: AlertTriangle,
  deprecation: Ban,
  calculation_logic: Calculator,
};

function ReviewDashboard({ items }: { items: PendingReviewItem[] }) {
  const orgSlug = useOrgSlug();
  return (
    <div>
      <div className={styles.header}>
        <ClipboardCheck className="h-5 w-5 text-primary" />
        <h2 className={styles.headerTitle}>ממתינים לאישור</h2>
        {items.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className={styles.emptyCard}>
            <ClipboardCheck className={`h-10 w-10 ${styles.emptyIcon}`} />
            <p className={styles.emptyTitle}>אין פריטים הממתינים לבדיקה</p>
            <p className={styles.emptySubtitle}>כל פריטי הידע מעודכנים ומאושרים</p>
          </CardContent>
        </Card>
      ) : (
        <div className={styles.list}>
          {items.map((item) => {
            const Icon =
              typeIcons[item.itemType as KnowledgeItemType] ?? BookOpen;
            const assetName =
              item.dataAsset.columnName ??
              item.dataAsset.tableName ??
              item.dataAsset.schemaName ??
              item.dataAsset.systemName;

            return (
              <Card
                key={item.id}
                className={styles.reviewCard}
              >
                <CardContent className={styles.cardContent}>
                  <div className={styles.cardInner}>
                    {/* Icon */}
                    <div className={styles.iconContainer}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className={styles.cardBody}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>{item.title}</h3>
                        <Badge variant="outline" className="text-[10px]">
                          {KNOWLEDGE_TYPE_LABELS[item.itemType as KnowledgeItemType]}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${styles.pendingBadge}`}
                        >
                          ממתין לבדיקה
                        </Badge>
                      </div>

                      {/* Content preview */}
                      {item.contentHebrew && (
                        <p className={styles.contentPreview} dir="rtl">
                          {item.contentHebrew}
                        </p>
                      )}
                      {item.contentEnglish && !item.contentHebrew && (
                        <p className={styles.contentPreview} dir="ltr">
                          {item.contentEnglish}
                        </p>
                      )}

                      {/* Meta row */}
                      <div className={styles.metaRow}>
                        <Link
                          href={`/${orgSlug}/assets/${item.dataAsset.id}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <LtrText className="body-xsmall-regular">{assetName}</LtrText>
                        </Link>
                        <span className={styles.metaItem}>
                          <User className="h-3 w-3" />
                          {item.author.displayName}
                        </span>
                        <span className={styles.metaItem}>
                          <Clock className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString("he-IL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0">
                      <ReviewActions itemId={item.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReviewDashboard;
