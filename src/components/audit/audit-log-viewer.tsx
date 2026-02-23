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
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={entityTypeFilter} onValueChange={applyFilter}>
          <SelectTrigger className="w-48">
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
        <span className="body-medium-regular mr-auto text-muted-foreground">
          {total} רשומות
        </span>
      </div>

      {/* Log List */}
      {logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="body-medium-regular">אין רשומות</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <Card key={log.id} className="transition-colors hover:bg-accent/30">
              <CardContent className="p-4">
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === log.id ? null : log.id)
                  }
                >
                  <div className="mt-0.5">
                    {log.user.avatarUrl ? (
                      <img
                        src={log.user.avatarUrl}
                        alt=""
                        className="h-7 w-7 rounded-full"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
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
                    <p className="body-small-regular mt-1 text-muted-foreground">
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

                  <div className="shrink-0 text-muted-foreground">
                    {expandedId === log.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
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
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isPending}
            onClick={loadMore}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
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
    <div className="mt-3 pt-3 border-t flex flex-col gap-2">
      <div className="body-small-regular text-muted-foreground">
        <LtrText className="body-tiny-regular font-mono text-[10px]">
          Entity ID: {log.entityId}
        </LtrText>
      </div>
      {hasOld && (
        <div>
          <p className="body-small-semibold text-muted-foreground mb-1">
            ערך קודם:
          </p>
          <LtrText>
            <pre className="text-xs bg-muted/50 p-2 rounded-lg overflow-x-auto">
              {JSON.stringify(oldVal, null, 2)}
            </pre>
          </LtrText>
        </div>
      )}
      {hasNew && (
        <div>
          <p className="body-small-semibold text-muted-foreground mb-1">
            ערך חדש:
          </p>
          <LtrText>
            <pre className="text-xs bg-muted/50 p-2 rounded-lg overflow-x-auto">
              {JSON.stringify(newVal, null, 2)}
            </pre>
          </LtrText>
        </div>
      )}
    </div>
  );
}

export default AuditLogViewer;
