"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Columns3,
  BookOpen,
  Server,
  Database,
  Table2,
  Hash,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  CircleDashed,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LtrText } from "@/components/ltr-text";
import { ASSET_TYPE_LABELS } from "@/types/domain";
import type { AssetType } from "@/types/domain";
import type { AssetWithKnowledge } from "@/app/actions/assets";
import {
  getColumnConflictStatus,
  type ConflictStatus,
} from "@/lib/utils/conflict-resolver";

const typeIcons: Record<AssetType, typeof Server> = {
  system: Server,
  schema: Database,
  table: Table2,
  column: Columns3,
};

const conflictIcons: Record<ConflictStatus, typeof ShieldCheck> = {
  verified: ShieldCheck,
  conflict: AlertTriangle,
  unverified: CircleDashed,
  empty: CircleDashed,
};

const conflictColors: Record<ConflictStatus, string> = {
  verified: "text-emerald-500",
  conflict: "text-amber-500",
  unverified: "text-muted-foreground/50",
  empty: "text-transparent",
};

const conflictLabels: Record<ConflictStatus, string> = {
  verified: "מאומת — ידע מאושר קיים",
  conflict: "קונפליקט — מקורות סותרים",
  unverified: "ממתין לאימות",
  empty: "",
};

export function SchemaViewer({ asset }: { asset: AssetWithKnowledge }) {
  const TypeIcon = typeIcons[asset.assetType as AssetType] ?? Database;

  const childKnowledgeByAsset = useMemo(() => {
    const map = new Map<string, typeof asset.childKnowledgeItems>();
    for (const ki of asset.childKnowledgeItems ?? []) {
      const existing = map.get(ki.dataAssetId) ?? [];
      existing.push(ki);
      map.set(ki.dataAssetId, existing);
    }
    return map;
  }, [asset.childKnowledgeItems]);

  return (
    <ScrollArea className="h-full" dir="ltr">
      <div className="p-5 space-y-5">
        {/* Metadata Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {ASSET_TYPE_LABELS[asset.assetType as AssetType]} Metadata
            </span>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <MetaLabel>System</MetaLabel>
            <LtrText className="font-semibold text-foreground">
              {asset.systemName}
            </LtrText>

            {asset.schemaName && (
              <>
                <MetaLabel>Schema</MetaLabel>
                <LtrText className="font-semibold text-foreground">
                  {asset.schemaName}
                </LtrText>
              </>
            )}
            {asset.tableName && (
              <>
                <MetaLabel>Table</MetaLabel>
                <LtrText className="font-semibold text-foreground">
                  {asset.tableName}
                </LtrText>
              </>
            )}
            {asset.columnName && (
              <>
                <MetaLabel>Column</MetaLabel>
                <LtrText className="font-semibold text-foreground">
                  {asset.columnName}
                </LtrText>
              </>
            )}
            {asset.dataType && (
              <>
                <MetaLabel>Data Type</MetaLabel>
                <LtrText className="font-medium text-teal-500">
                  {asset.dataType}
                </LtrText>
              </>
            )}
            {asset.description && (
              <>
                <MetaLabel>Description</MetaLabel>
                <span className="text-foreground">{asset.description}</span>
              </>
            )}
            {asset.hebrewName && (
              <>
                <MetaLabel>Hebrew</MetaLabel>
                <span className="text-foreground" dir="rtl">
                  {asset.hebrewName}
                </span>
              </>
            )}
            {asset.owner && (
              <>
                <MetaLabel>Owner</MetaLabel>
                <span className="text-foreground" dir="rtl">
                  {asset.owner.displayName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Column Grid (for table assets) */}
        {asset.children && asset.children.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Columns3 className="h-4 w-4 text-primary" />
                Columns
              </h3>
              <Badge variant="outline" className="text-xs gap-1">
                <Hash className="h-3 w-3" />
                {asset.children.length}
              </Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-center px-2 py-2.5 w-8" />
                    <th className="text-left px-3 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                      Column
                    </th>
                    <th className="text-left px-3 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th
                      className="text-right px-3 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground"
                      dir="rtl"
                    >
                      שם עברי
                    </th>
                    <th className="text-center px-3 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground w-16">
                      <BookOpen className="h-3.5 w-3.5 mx-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {asset.children.map((col, idx) => {
                    const knowledgeCount =
                      "_count" in col
                        ? (col._count as { knowledgeItems: number })
                            .knowledgeItems
                        : 0;

                    const colKnowledge =
                      childKnowledgeByAsset.get(col.id) ?? [];
                    const conflict = getColumnConflictStatus(colKnowledge, null);
                    const ConflictIcon =
                      conflict.hasDeprecation
                        ? Ban
                        : conflictIcons[conflict.status];
                    const conflictColor = conflict.hasDeprecation
                      ? "text-red-500"
                      : conflictColors[conflict.status];

                    return (
                      <tr
                        key={col.id}
                        className={`border-t border-border/50 hover:bg-primary/5 transition-colors group ${
                          idx % 2 === 0 ? "" : "bg-muted/20"
                        }`}
                      >
                        <td className="px-2 py-2.5 text-center">
                          {conflict.status !== "empty" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={conflictColor}>
                                  <ConflictIcon className="h-3.5 w-3.5 mx-auto" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent dir="rtl" className="max-w-48">
                                <p className="text-xs">
                                  {conflict.hasDeprecation
                                    ? "הוצא משימוש"
                                    : conflictLabels[conflict.status]}
                                </p>
                                {conflict.approvedCount > 0 && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {conflict.approvedCount} מאושרים מתוך{" "}
                                    {conflict.totalCount}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <Link
                            href={`/assets/${col.id}`}
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            <LtrText className="font-mono text-xs font-medium">
                              {col.columnName}
                            </LtrText>
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </Link>
                        </td>
                        <td className="px-3 py-2.5">
                          <LtrText className="text-xs text-teal-500 font-mono">
                            {col.dataType}
                          </LtrText>
                        </td>
                        <td className="px-3 py-2.5 text-right" dir="rtl">
                          <span className="text-xs text-muted-foreground">
                            {col.hebrewName}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {knowledgeCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 min-w-5 justify-center"
                            >
                              {knowledgeCount}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Parent breadcrumb */}
        {asset.parent && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground" dir="rtl">
              חלק מ:{" "}
              <Link
                href={`/assets/${asset.parent.id}`}
                className="text-primary hover:underline"
              >
                <LtrText>
                  {asset.parent.tableName ??
                    asset.parent.schemaName ??
                    asset.parent.systemName}
                </LtrText>
              </Link>
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap">
      {children}
    </span>
  );
}
