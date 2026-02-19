"use client";

import Link from "next/link";
import { Columns3, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LtrText } from "@/components/ltr-text";
import type { getAssetById } from "@/app/actions/assets";

type Asset = NonNullable<Awaited<ReturnType<typeof getAssetById>>>;

export function SchemaViewer({ asset }: { asset: Asset }) {
  return (
    <ScrollArea className="h-full" dir="ltr">
      <div className="p-4 space-y-4">
        {/* Asset Metadata */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>System:</span>
            <LtrText className="font-medium text-foreground">
              {asset.systemName}
            </LtrText>
          </div>
          {asset.schemaName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Schema:</span>
              <LtrText className="font-medium text-foreground">
                {asset.schemaName}
              </LtrText>
            </div>
          )}
          {asset.tableName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Table:</span>
              <LtrText className="font-medium text-foreground">
                {asset.tableName}
              </LtrText>
            </div>
          )}
          {asset.dataType && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Type:</span>
              <LtrText className="font-medium text-foreground">
                {asset.dataType}
              </LtrText>
            </div>
          )}
          {asset.description && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Description:</span>
              <span className="text-foreground">{asset.description}</span>
            </div>
          )}
          {asset.owner && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" dir="rtl">
              <span>בעלים:</span>
              <span className="text-foreground">
                {asset.owner.displayName}
              </span>
            </div>
          )}
        </div>

        {/* Column List (for tables) */}
        {asset.children && asset.children.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Columns3 className="h-4 w-4" />
              Columns ({asset.children.length})
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 font-medium">Column</th>
                    <th className="text-left px-3 py-2 font-medium">Type</th>
                    <th className="text-right px-3 py-2 font-medium" dir="rtl">
                      שם עברי
                    </th>
                    <th className="text-center px-3 py-2 font-medium">
                      <BookOpen className="h-3.5 w-3.5 mx-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {asset.children.map((col) => (
                    <tr
                      key={col.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={`/assets/${col.id}`}
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <LtrText className="font-mono text-xs">
                            {col.columnName}
                          </LtrText>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <LtrText className="text-xs text-muted-foreground">
                          {col.dataType}
                        </LtrText>
                      </td>
                      <td className="px-3 py-2 text-right" dir="rtl">
                        <span className="text-xs">{col.hebrewName}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {"knowledgeItems" in col &&
                          Array.isArray(col.knowledgeItems) &&
                          col.knowledgeItems.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {col.knowledgeItems.length}
                            </Badge>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Parent info */}
        {asset.parent && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground" dir="rtl">
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
