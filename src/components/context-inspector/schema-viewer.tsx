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
import { useOrgSlug } from "@/lib/org-context";
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

function SchemaViewer({ asset }: { asset: AssetWithKnowledge }) {
  const orgSlug = useOrgSlug();
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
      <div className="p-4 space-y-6">
        {/* Metadata Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <TypeIcon className="h-4 w-4 text-primary" />
            <span className="body-xsmall-bold uppercase tracking-wider text-muted-foreground">
              {ASSET_TYPE_LABELS[asset.assetType as AssetType]} Metadata
            </span>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 body-small-regular">
            <MetaLabel>System</MetaLabel>
            <LtrText className="body-small-semibold text-foreground">
              {asset.systemName}
            </LtrText>

            {asset.schemaName && (
              <>
                <MetaLabel>Schema</MetaLabel>
                <LtrText className="body-small-semibold text-foreground">
                  {asset.schemaName}
                </LtrText>
              </>
            )}
            {asset.tableName && (
              <>
                <MetaLabel>Table</MetaLabel>
                <LtrText className="body-small-semibold text-foreground">
                  {asset.tableName}
                </LtrText>
              </>
            )}
            {asset.columnName && (
              <>
                <MetaLabel>Column</MetaLabel>
                <LtrText className="body-small-semibold text-foreground">
                  {asset.columnName}
                </LtrText>
              </>
            )}
            {asset.dataType && (
              <>
                <MetaLabel>Data Type</MetaLabel>
                <span className="body-medium-regular text-teal-500">
                  {asset.dataType}
                </span>
              </>
            )}
            {asset.description && (
              <>
                <MetaLabel>Description</MetaLabel>
                <span className="body-small-regular text-foreground">
                  {asset.description}
                </span>
              </>
            )}
            {asset.hebrewName && (
              <>
                <MetaLabel>Hebrew</MetaLabel>
                <span className="body-small-regular text-foreground" dir="rtl">
                  {asset.hebrewName}
                </span>
              </>
            )}
            {asset.owner && (
              <>
                <MetaLabel>Owner</MetaLabel>
                <span className="body-small-regular text-foreground" dir="rtl">
                  {asset.owner.displayName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Column Grid (for table assets) */}
        {asset.children && asset.children.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <Columns3 className="h-4 w-4 text-primary" />
                Columns
              </h3>
              <Badge variant="outline" className="text-xs gap-1">
                <Hash className="h-3 w-3" />
                {asset.children.length}
              </Badge>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left text-center w-8" />
                    <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left">Column</th>
                    <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left">Type</th>
                    <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left text-right" dir="rtl">
                      שם עברי
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left text-center w-16">
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
                        className={`border-t transition-colors hover:bg-muted/30 group ${
                          idx % 2 === 0 ? "" : "bg-muted/10"
                        }`}
                      >
                        <td className="px-3 py-2 text-center">
                          {conflict.status !== "empty" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={conflictColor}>
                                  <ConflictIcon className="h-3.5 w-3.5 mx-auto" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent dir="rtl" className="max-w-48">
                                <p className="body-small-regular">
                                  {conflict.hasDeprecation
                                    ? "הוצא משימוש"
                                    : conflictLabels[conflict.status]}
                                </p>
                                {conflict.approvedCount > 0 && (
                                  <p className="body-tiny-regular text-muted-foreground mt-0.5">
                                    {conflict.approvedCount} מאושרים מתוך{" "}
                                    {conflict.totalCount}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/${orgSlug}/assets/${col.id}`}
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            <LtrText className="body-xsmall-bold font-mono">
                              {col.columnName}
                            </LtrText>
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <LtrText className="body-xsmall-regular text-teal-500 font-mono">
                            {col.dataType}
                          </LtrText>
                        </td>
                        <td className="px-3 py-2 text-right" dir="rtl">
                          <span className="body-xsmall-regular text-muted-foreground">
                            {col.hebrewName}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
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
          <div className="pt-4 border-t">
            <p className="body-xsmall-regular text-muted-foreground" dir="rtl">
              חלק מ:{" "}
              <Link
                href={`/${orgSlug}/assets/${asset.parent.id}`}
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
  return <span className="text-xs text-muted-foreground uppercase tracking-wider">{children}</span>;
}

export default SchemaViewer;
