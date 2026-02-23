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
      <div className="flex items-center gap-2 mb-4">
        <ClipboardCheck className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">ממתינים לאישור</h2>
        {items.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardCheck className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">אין פריטים הממתינים לבדיקה</p>
            <p className="text-xs text-muted-foreground/70 mt-1">כל פריטי הידע מעודכנים ומאושרים</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
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
                className="border-r-2 border-r-gold-400 hover:shadow-md transition-shadow rounded-xl"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gold-100 text-gold-600 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-sm font-semibold truncate">{item.title}</h3>
                        <Badge variant="outline" className="text-[10px]">
                          {KNOWLEDGE_TYPE_LABELS[item.itemType as KnowledgeItemType]}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-gold-100 text-gold-700"
                        >
                          ממתין לבדיקה
                        </Badge>
                      </div>

                      {/* Content preview */}
                      {item.contentHebrew && (
                        <p className="text-xs text-muted-foreground line-clamp-2" dir="rtl">
                          {item.contentHebrew}
                        </p>
                      )}
                      {item.contentEnglish && !item.contentHebrew && (
                        <p className="text-xs text-muted-foreground line-clamp-2" dir="ltr">
                          {item.contentEnglish}
                        </p>
                      )}

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <Link
                          href={`/${orgSlug}/assets/${item.dataAsset.id}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <LtrText className="body-xsmall-regular">{assetName}</LtrText>
                        </Link>
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.author.displayName}
                        </span>
                        <span className="inline-flex items-center gap-1">
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
