"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LtrText } from "@/components/ltr-text";
import { ReviewActions } from "./review-actions";
import { KNOWLEDGE_TYPE_LABELS } from "@/types/domain";
import type { KnowledgeItemType } from "@/types/domain";
import type { PendingReviewItem } from "@/app/actions/knowledge";
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

export function ReviewDashboard({ items }: { items: PendingReviewItem[] }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <ClipboardCheck className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">ממתינים לאישור</h2>
        {items.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">אין פריטים הממתינים לבדיקה</p>
            <p className="text-xs mt-1">כל פריטי הידע מעודכנים ומאושרים</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
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
                className="border-r-2 border-r-amber-400 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 shrink-0 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                        <Badge variant="outline" className="text-[10px]">
                          {KNOWLEDGE_TYPE_LABELS[item.itemType as KnowledgeItemType]}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                        >
                          ממתין לבדיקה
                        </Badge>
                      </div>

                      {/* Content preview */}
                      {item.contentHebrew && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {item.contentHebrew}
                        </p>
                      )}
                      {item.contentEnglish && !item.contentHebrew && (
                        <p
                          className="text-sm text-muted-foreground leading-relaxed line-clamp-2"
                          dir="ltr"
                        >
                          {item.contentEnglish}
                        </p>
                      )}

                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <Link
                          href={`/assets/${item.dataAsset.id}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <LtrText className="text-xs">{assetName}</LtrText>
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
