"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LtrText } from "@/components/ltr-text";
import { getAuditLogs } from "@/app/actions/audit";
import {
  History,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  User,
} from "lucide-react";
import styles from "./AuditLogViewer.module.css";

interface AuditLog {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  oldValue: unknown;
  newValue: unknown;
  createdAt: Date;
  user: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface AuditLogViewerProps {
  initialLogs: AuditLog[];
  totalCount: number;
  entityTypes: string[];
}

const ACTION_LABELS: Record<string, string> = {
  submit_draft: "שליחת טיוטה",
  status_change_to_approved: "אישור",
  status_change_to_rejected: "דחייה",
  verify_freshness: "אימות עדכניות",
  generate_insight: "יצירת תובנת AI",
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  KnowledgeItem: "פריט ידע",
  DataAsset: "נכס מידע",
  AIInsight: "תובנת AI",
};

function AuditLogViewer({
  initialLogs,
  totalCount,
  entityTypes,
}: AuditLogViewerProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(totalCount);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const pageSize = 50;
  const hasMore = (page + 1) * pageSize < total;

  const applyFilter = (entityType: string) => {
    setEntityTypeFilter(entityType);
    setPage(0);
    startTransition(async () => {
      const result = await getAuditLogs({
        entityType: entityType === "all" ? undefined : entityType,
        limit: pageSize,
        offset: 0,
      });
      setLogs(result.logs as AuditLog[]);
      setTotal(result.total);
    });
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    startTransition(async () => {
      const result = await getAuditLogs({
        entityType: entityTypeFilter === "all" ? undefined : entityTypeFilter,
        limit: pageSize,
        offset: nextPage * pageSize,
      });
      setLogs((prev) => [...prev, ...(result.logs as AuditLog[])]);
    });
  };

  return (
    <div className={styles.container}>
      {/* Filters */}
      <div className={styles.filtersRow}>
        <Filter className={styles.filterIcon} />
        <Select value={entityTypeFilter} onValueChange={applyFilter}>
          <SelectTrigger className={styles.selectTrigger}>
            <SelectValue placeholder="סנן לפי סוג..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            {entityTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {ENTITY_TYPE_LABELS[type] ?? type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className={`body-medium-regular ${styles.countLabel}`}>
          {total} רשומות
        </span>
      </div>

      {/* Log List */}
      {logs.length === 0 ? (
        <div className={styles.emptyState}>
          <History className={styles.emptyStateIcon} />
          <p className="body-medium-regular">אין רשומות</p>
        </div>
      ) : (
        <div className={styles.logList}>
          {logs.map((log) => (
            <Card key={log.id} className={styles.card}>
              <CardContent className={styles.cardContent}>
                <div
                  className={styles.logRow}
                  onClick={() =>
                    setExpandedId(expandedId === log.id ? null : log.id)
                  }
                >
                  <div className="mt-0.5">
                    {log.user.avatarUrl ? (
                      <img
                        src={log.user.avatarUrl}
                        alt=""
                        className={styles.avatarImg}
                      />
                    ) : (
                      <div className={styles.avatarFallback}>
                        <User className={styles.avatarIcon} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={styles.badgesRow}>
                      <span className="body-medium-semibold">
                        {log.user.displayName}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ENTITY_TYPE_LABELS[log.entityType] ?? log.entityType}
                      </Badge>
                    </div>
                    <p className={`body-small-regular ${styles.timestamp}`}>
                      {new Date(log.createdAt).toLocaleDateString("he-IL", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className={`shrink-0 ${styles.chevronWrapper}`}>
                    {expandedId === log.id ? (
                      <ChevronUp className={styles.chevronIcon} />
                    ) : (
                      <ChevronDown className={styles.chevronIcon} />
                    )}
                  </div>
                </div>

                {expandedId === log.id && (
                  <AuditLogDetails log={log} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className={styles.loadMoreWrapper}>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isPending}
            onClick={loadMore}
          >
            {isPending ? (
              <Loader2 className={`${styles.chevronIcon} animate-spin`} />
            ) : (
              <ChevronDown className={styles.chevronIcon} />
            )}
            טען עוד
          </Button>
        </div>
      )}
    </div>
  );
}

function AuditLogDetails({ log }: { log: AuditLog }) {
  const oldVal = log.oldValue as Record<string, unknown> | null;
  const newVal = log.newValue as Record<string, unknown> | null;
  const hasOld = oldVal && typeof oldVal === "object" && Object.keys(oldVal).length > 0;
  const hasNew = newVal && typeof newVal === "object" && Object.keys(newVal).length > 0;

  return (
    <div className={styles.detailsSection}>
      <div className={`body-small-regular ${styles.entityId}`}>
        <LtrText className={`body-tiny-regular ${styles.entityIdMono}`}>
          Entity ID: {log.entityId}
        </LtrText>
      </div>
      {hasOld && (
        <div>
          <p className={`body-small-semibold ${styles.detailLabel}`}>
            ערך קודם:
          </p>
          <LtrText>
            <pre className={styles.codeBlock}>
              {JSON.stringify(oldVal, null, 2)}
            </pre>
          </LtrText>
        </div>
      )}
      {hasNew && (
        <div>
          <p className={`body-small-semibold ${styles.detailLabel}`}>
            ערך חדש:
          </p>
          <LtrText>
            <pre className={styles.codeBlock}>
              {JSON.stringify(newVal, null, 2)}
            </pre>
          </LtrText>
        </div>
      )}
    </div>
  );
}

export default AuditLogViewer;
