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
import styles from "./SchemaViewer.module.css";

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
      <div className={styles.root}>
        {/* Metadata Header */}
        <div className={styles.metaSection}>
          <div className={styles.metaHeader}>
            <TypeIcon className="h-4 w-4 text-primary" />
            <span className="body-xsmall-bold uppercase tracking-wider text-muted-foreground">
              {ASSET_TYPE_LABELS[asset.assetType as AssetType]} Metadata
            </span>
          </div>

          <div className={`${styles.metaGrid} body-small-regular`}>
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
          <div className={styles.columnsSection}>
            <div className={styles.columnsHeader}>
              <h3 className={styles.columnsTitle}>
                <Columns3 className="h-4 w-4 text-primary" />
                Columns
              </h3>
              <Badge variant="outline" className="text-xs gap-1">
                <Hash className="h-3 w-3" />
                {asset.children.length}
              </Badge>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHead}>
                    <th className={`${styles.tableHeader} ${styles.tableHeaderCenter} w-8`} />
                    <th className={styles.tableHeader}>Column</th>
                    <th className={styles.tableHeader}>Type</th>
                    <th className={`${styles.tableHeader} ${styles.tableHeaderRight}`} dir="rtl">
                      שם עברי
                    </th>
                    <th className={`${styles.tableHeader} ${styles.tableHeaderCenter} w-16`}>
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
                        className={`${styles.tableRow} group ${
                          idx % 2 === 0 ? "" : styles.tableRowAlt
                        }`}
                      >
                        <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
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
                        <td className={styles.tableCell}>
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
                        <td className={styles.tableCell}>
                          <LtrText className="body-xsmall-regular text-teal-500 font-mono">
                            {col.dataType}
                          </LtrText>
                        </td>
                        <td className={`${styles.tableCell} ${styles.tableCellRight}`} dir="rtl">
                          <span className="body-xsmall-regular text-muted-foreground">
                            {col.hebrewName}
                          </span>
                        </td>
                        <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
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
          <div className={styles.parentBreadcrumb}>
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
  return <span className={styles.metaLabel}>{children}</span>;
}

export default SchemaViewer;
