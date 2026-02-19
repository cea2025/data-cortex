"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SchemaViewer } from "./schema-viewer";
import { KnowledgeTabs } from "./knowledge-tabs";
import { Omnibar } from "@/components/omnibar";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { useUIStore } from "@/lib/store/ui-store";
import Link from "next/link";
import type { getAssetById } from "@/app/actions/assets";

type Asset = NonNullable<Awaited<ReturnType<typeof getAssetById>>>;

export function ContextInspector({ asset }: { asset: Asset }) {
  const { setOmnibarOpen } = useUIStore();

  return (
    <div className="flex flex-col h-full">
      <Omnibar />

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold" dir="ltr">
            {asset.columnName ?? asset.tableName ?? asset.schemaName ?? asset.systemName}
          </h1>
          {asset.hebrewName && (
            <p className="text-sm text-muted-foreground">{asset.hebrewName}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setOmnibarOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span>חיפוש</span>
        </Button>
      </div>

      {/* Split Pane */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize={55} minSize={30}>
          <SchemaViewer asset={asset} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45} minSize={25}>
          <KnowledgeTabs asset={asset} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
