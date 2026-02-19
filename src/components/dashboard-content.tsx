"use client";

import Link from "next/link";
import { Table2, BookOpen, Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LtrText } from "@/components/ltr-text";
import { Omnibar } from "@/components/omnibar";
import { useUIStore } from "@/lib/store/ui-store";
import { ASSET_TYPE_LABELS } from "@/types/domain";

interface TableAsset {
  id: string;
  assetType: string;
  tableName: string | null;
  hebrewName: string | null;
  systemName: string;
  schemaName: string | null;
  owner: { displayName: string } | null;
  _count: { knowledgeItems: number; children: number };
}

export function DashboardContent({ tables }: { tables: TableAsset[] }) {
  const { setOmnibarOpen } = useUIStore();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <Omnibar />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Cortex</h1>
          <p className="text-muted-foreground mt-1">
            מנוע ממשל נתונים ואמון לבנקאות ליבה
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 min-w-[240px] justify-start text-muted-foreground"
          onClick={() => setOmnibarOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span>חיפוש...</span>
          <kbd className="mr-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">Ctrl</span>K
          </kbd>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">טבלאות</CardTitle>
            <Table2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
            <p className="text-xs text-muted-foreground">
              ב-{ASSET_TYPE_LABELS.system} בנקאות ליבה
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">פריטי ידע</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tables.reduce((sum, t) => sum + t._count.knowledgeItems, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              מתועדים ומאושרים
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">עמודות</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tables.reduce((sum, t) => sum + t._count.children, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              עמודות ממופות
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">טבלאות Tier-1</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <Link key={table.id} href={`/assets/${table.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {ASSET_TYPE_LABELS[table.assetType as keyof typeof ASSET_TYPE_LABELS]}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      {table._count.knowledgeItems}
                    </Badge>
                  </div>
                  <LtrText className="text-base font-semibold mt-2 block">
                    {table.tableName}
                  </LtrText>
                  {table.hebrewName && (
                    <p className="text-sm text-muted-foreground">
                      {table.hebrewName}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <LtrText>
                      {table.systemName}
                      {table.schemaName ? `.${table.schemaName}` : ""}
                    </LtrText>
                    <span>{table._count.children} עמודות</span>
                  </div>
                  {table.owner && (
                    <div className="text-xs text-muted-foreground mt-2">
                      בעלים: {table.owner.displayName}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
