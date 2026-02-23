"use client";

import Link from "next/link";
import {
  Table2,
  Columns3,
  BookOpen,
  Search,
  Trophy,
  Sparkles,
  TrendingUp,
  Database,
  Clock,
  Target,
  AlertTriangle,
  Ban,
  Calculator,
  ScrollText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { LtrText } from "@/components/ltr-text";
import { useUIStore } from "@/lib/store/ui-store";
import { useOrgSlug } from "@/lib/org-context";
import { KNOWLEDGE_TYPE_LABELS } from "@/types/domain";
import type { KnowledgeItemType } from "@/types/domain";
import type { DashboardStats } from "@/app/actions/analytics";

const knowledgeIcons: Record<KnowledgeItemType, typeof BookOpen> = {
  business_rule: ScrollText,
  warning: AlertTriangle,
  deprecation: Ban,
  calculation_logic: Calculator,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatNumber(n: number): string {
  return n.toLocaleString("he-IL");
}

const medalColors = [
  "from-amber-400 to-yellow-500",
  "from-slate-300 to-slate-400",
  "from-orange-400 to-amber-600",
];

export function CoverageDashboard({ stats }: { stats: DashboardStats }) {
  const { openSearch } = useUIStore();
  const orgSlug = useOrgSlug();

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Cortex</h1>
          <p className="text-muted-foreground mt-1">
            לוח בקרה — כיסוי תיעוד מטא-דאטה
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 min-w-[240px] justify-start text-muted-foreground"
          onClick={openSearch}
        >
          <Search className="h-4 w-4" />
          <span>חיפוש...</span>
          <kbd className="mr-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">Ctrl</span>K
          </kbd>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">טבלאות</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10">
              <Table2 className="h-5 w-5 text-teal-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {formatNumber(stats.totalTables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ב-{stats.systemBreakdown.length} מערכות
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">עמודות</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Columns3 className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {formatNumber(stats.totalColumns)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              עמודות ממופות
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">פריטי ידע מאושרים</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <BookOpen className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {formatNumber(stats.totalKnowledgeItems)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.documentedAssetsCount} נכסים מתועדים
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">כיסוי תיעוד</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
              <Target className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {stats.coveragePercentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              מתוך {formatNumber(stats.totalTables + stats.totalColumns)} נכסים
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Progress + System Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coverage Card - 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>התקדמות כיסוי תיעוד</CardTitle>
            </div>
            <CardDescription>
              כמה מהנכסים (טבלאות + עמודות) מתועדים עם לפחות פריט ידע מאושר אחד
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">כיסוי כולל</span>
                <span className="text-2xl font-bold tabular-nums">
                  {stats.coveragePercentage}%
                </span>
              </div>
              <Progress
                value={stats.coveragePercentage}
                className="h-4 [&>[data-slot=progress-indicator]]:bg-gradient-to-l [&>[data-slot=progress-indicator]]:from-teal-500 [&>[data-slot=progress-indicator]]:to-emerald-500"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatNumber(stats.documentedAssetsCount)} מתועדים</span>
                <span>
                  {formatNumber(
                    stats.totalTables + stats.totalColumns - stats.documentedAssetsCount
                  )}{" "}
                  ממתינים לתיעוד
                </span>
              </div>
            </div>

            {/* Call to action */}
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-4">
              <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">עזרו לנו לתעד!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  כל פריט ידע שתוסיפו משפר את ההבנה הארגונית של מבני הנתונים
                </p>
              </div>
              <Link href={`/${orgSlug}/contribute`}>
                <Button size="sm" className="gap-1.5 shrink-0">
                  <BookOpen className="h-3.5 w-3.5" />
                  הוסף ידע
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>מערכות</CardTitle>
            </div>
            <CardDescription>פילוח טבלאות לפי מערכת מקור</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.systemBreakdown.map((system) => {
                const pct =
                  stats.totalTables > 0
                    ? Math.round((system.tableCount / stats.totalTables) * 100)
                    : 0;
                return (
                  <div key={system.systemName} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <LtrText className="font-semibold text-sm">
                        {system.systemName}
                      </LtrText>
                      <span className="text-muted-foreground tabular-nums">
                        {system.tableCount} טבלאות
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className="h-2 [&>[data-slot=progress-indicator]]:bg-blue-500"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Contributors + Recent Knowledge */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle>תורמים מובילים</CardTitle>
            </div>
            <CardDescription>
              המשתמשים עם הכי הרבה פריטי ידע מאושרים
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topContributors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">אין תורמים עדיין</p>
                <p className="text-xs mt-1">
                  היו הראשונים להוסיף ידע ולהופיע כאן!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topContributors.map((contributor, idx) => (
                  <div
                    key={contributor.id}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="relative">
                      <Avatar size="lg">
                        {contributor.avatarUrl ? (
                          <AvatarImage
                            src={contributor.avatarUrl}
                            alt={contributor.displayName}
                          />
                        ) : null}
                        <AvatarFallback>
                          {getInitials(contributor.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      {idx < 3 && (
                        <div
                          className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${medalColors[idx]} text-[10px] font-bold text-white shadow-sm`}
                        >
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {contributor.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contributor.count} פריטי ידע מאושרים
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="tabular-nums shrink-0 text-xs gap-1"
                    >
                      <BookOpen className="h-3 w-3" />
                      {contributor.count}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Knowledge */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>ידע שאושר לאחרונה</CardTitle>
            </div>
            <CardDescription>
              פריטי הידע האחרונים שעברו אישור
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentKnowledge.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">אין פריטי ידע מאושרים עדיין</p>
                <p className="text-xs mt-1">
                  התחילו לתעד ופריטים שיאושרו יופיעו כאן
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.recentKnowledge.map((item) => {
                  const Icon =
                    knowledgeIcons[item.itemType as KnowledgeItemType] ??
                    BookOpen;
                  const assetLabel =
                    item.dataAsset.columnName ??
                    item.dataAsset.tableName ??
                    item.dataAsset.systemName;

                  return (
                    <Link
                      key={item.id}
                      href={`/${orgSlug}/assets/${item.dataAsset.id}`}
                    >
                      <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 cursor-pointer">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 mt-0.5">
                          <Icon className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {item.title}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-[10px] shrink-0"
                            >
                              {
                                KNOWLEDGE_TYPE_LABELS[
                                  item.itemType as KnowledgeItemType
                                ]
                              }
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <LtrText className="text-xs truncate">
                              {assetLabel}
                            </LtrText>
                            <span>·</span>
                            <span>{item.author.displayName}</span>
                            <span>·</span>
                            <span>
                              {new Date(item.createdAt).toLocaleDateString(
                                "he-IL",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
