"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import SchemaViewer from "./schema-viewer";
import KnowledgeTabs from "./knowledge-tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowRight,
  Server,
  Database,
  Table2,
  Columns3,
} from "lucide-react";
import { useUIStore } from "@/lib/store/ui-store";
import Link from "next/link";
import { LtrText } from "@/components/ltr-text";
import { ASSET_TYPE_LABELS } from "@/types/domain";
import type { AssetType } from "@/types/domain";
import type { AssetWithKnowledge } from "@/app/actions/assets";
import { useOrgSlug } from "@/lib/org-context";

const typeIcons: Record<AssetType, typeof Server> = {
  system: Server,
  schema: Database,
  table: Table2,
  column: Columns3,
};

function ContextInspector({ asset }: { asset: AssetWithKnowledge }) {
  const { openSearch } = useUIStore();
  const orgSlug = useOrgSlug();
  const TypeIcon = typeIcons[asset.assetType as AssetType] ?? Database;
  const displayName =
    asset.columnName ??
    asset.tableName ??
    asset.schemaName ??
    asset.systemName;

  const knowledgeCount =
    asset.knowledgeItems.length + (asset.childKnowledgeItems?.length ?? 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white dark:bg-navy-950">
        <Link href={`/${orgSlug}/`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-navy-100 text-navy-600 dark:bg-navy-900 dark:text-navy-300">
            <TypeIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <LtrText className="text-base font-bold truncate">
                {displayName}
              </LtrText>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {ASSET_TYPE_LABELS[asset.assetType as AssetType]}
              </Badge>
            </div>
            {asset.hebrewName && (
              <p className="text-xs text-muted-foreground truncate" dir="rtl">
                {asset.hebrewName}
              </p>
            )}
          </div>
        </div>

        <div className="mr-auto flex items-center gap-2">
          {knowledgeCount > 0 && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {knowledgeCount} פריטי ידע
            </Badge>
          )}
          {asset.children.length > 0 && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {asset.children.length} עמודות
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={openSearch}
        >
          <Search className="h-3.5 w-3.5" />
          <span>חיפוש</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
            Ctrl+K
          </kbd>
        </Button>
      </div>

      {/* Split Pane */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0">
        <ResizablePanel defaultSize={60} minSize={30}>
          <SchemaViewer asset={asset} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={25}>
          <KnowledgeTabs asset={asset} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default ContextInspector;
