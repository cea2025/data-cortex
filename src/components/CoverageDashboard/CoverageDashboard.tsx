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

const medalClasses = [
  "bg-gradient-to-br from-yellow-400 to-amber-500",
  "bg-gradient-to-br from-gray-300 to-gray-400",
  "bg-gradient-to-br from-orange-400 to-orange-600",
];

function CoverageDashboard({ stats }: { stats: DashboardStats }) {
  const { openSearch } = useUIStore();
  const orgSlug = useOrgSlug();

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-h1-bold text-gray-900 dark:text-cream-100">
            Data Cortex
          </h1>
          <p className="body-medium-regular text-gray-500 dark:text-gray-400 mt-1">
            לוח בקרה — כיסוי תיעוד מטא-דאטה
          </p>
        </div>
        <Button
          variant="outline"
          className="min-w-[240px] justify-start text-gray-500 dark:text-gray-400 gap-2"
          onClick={openSearch}
        >
          <Search size={16} />
          <span className="body-medium-regular">חיפוש...</span>
          <kbd className="ms-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-gray-300 dark:border-navy-700 bg-gray-100 dark:bg-navy-900 px-1.5 font-mono text-gray-500 dark:text-gray-400 body-tiny-regular">
            <span>Ctrl</span>K
          </kbd>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl shadow-sm border-t-4 border-t-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="body-medium-semibold">טבלאות</CardTitle>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <Table2 size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="heading-h1-bold text-gray-900 dark:text-cream-100 tabular-nums">
              {formatNumber(stats.totalTables)}
            </div>
            <p className="body-small-regular text-gray-500 dark:text-gray-400 mt-1">
              ב-{stats.systemBreakdown.length} מערכות
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="body-medium-semibold">עמודות</CardTitle>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Columns3 size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="heading-h1-bold text-gray-900 dark:text-cream-100 tabular-nums">
              {formatNumber(stats.totalColumns)}
            </div>
            <p className="body-small-regular text-gray-500 dark:text-gray-400 mt-1">
              עמודות ממופות
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="body-medium-semibold">פריטי ידע מאושרים</CardTitle>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <BookOpen size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="heading-h1-bold text-gray-900 dark:text-cream-100 tabular-nums">
              {formatNumber(stats.totalKnowledgeItems)}
            </div>
            <p className="body-small-regular text-gray-500 dark:text-gray-400 mt-1">
              {stats.documentedAssetsCount} נכסים מתועדים
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="body-medium-semibold">כיסוי תיעוד</CardTitle>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Target size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="heading-h1-bold text-gray-900 dark:text-cream-100 tabular-nums">
              {stats.coveragePercentage}%
            </div>
            <p className="body-small-regular text-gray-500 dark:text-gray-400 mt-1">
              מתוך {formatNumber(stats.totalTables + stats.totalColumns)} נכסים
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Progress + System Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-gray-700 dark:text-gray-300" />
              <CardTitle>התקדמות כיסוי תיעוד</CardTitle>
            </div>
            <CardDescription>
              כמה מהנכסים (טבלאות + עמודות) מתועדים עם לפחות פריט ידע מאושר אחד
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="body-medium-semibold text-gray-900 dark:text-cream-100">כיסוי כולל</span>
                <span className="heading-h2-bold text-gray-900 dark:text-cream-100 tabular-nums">
                  {stats.coveragePercentage}%
                </span>
              </div>
              <Progress
                value={stats.coveragePercentage}
                className="h-4 [&>[data-slot=progress-indicator]]:bg-gradient-to-l [&>[data-slot=progress-indicator]]:from-teal-500 [&>[data-slot=progress-indicator]]:to-emerald-500"
              />
              <div className="flex items-center justify-between">
                <span className="body-small-regular text-gray-500 dark:text-gray-400">
                  {formatNumber(stats.documentedAssetsCount)} מתועדים
                </span>
                <span className="body-small-regular text-gray-500 dark:text-gray-400">
                  {formatNumber(stats.totalTables + stats.totalColumns - stats.documentedAssetsCount)} ממתינים לתיעוד
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 mt-6 rounded-xl border border-dashed border-gold-400 bg-gold-50 dark:bg-gold-950/20">
              <Sparkles size={20} className="shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="body-medium-semibold text-gray-900 dark:text-cream-100">עזרו לנו לתעד!</p>
                <p className="body-small-regular text-gray-500 dark:text-gray-400 mt-0.5">
                  כל פריט ידע שתוסיפו משפר את ההבנה הארגונית של מבני הנתונים
                </p>
              </div>
              <Link href={`/${orgSlug}/contribute`}>
                <Button size="sm" className="gap-1.5">
                  <BookOpen size={14} />
                  הוסף ידע
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database size={20} className="text-gray-700 dark:text-gray-300" />
              <CardTitle>מערכות</CardTitle>
            </div>
            <CardDescription>פילוח טבלאות לפי מערכת מקור</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {stats.systemBreakdown.map((system) => {
                const pct =
                  stats.totalTables > 0
                    ? Math.round((system.tableCount / stats.totalTables) * 100)
                    : 0;
                return (
                  <div key={system.systemName} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <LtrText className="body-medium-semibold text-gray-900 dark:text-cream-100">
                        {system.systemName}
                      </LtrText>
                      <span className="body-small-regular text-gray-500 dark:text-gray-400 tabular-nums">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" />
              <CardTitle>תורמים מובילים</CardTitle>
            </div>
            <CardDescription>
              המשתמשים עם הכי הרבה פריטי ידע מאושרים
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topContributors.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Trophy size={40} className="mx-auto mb-3 opacity-20" />
                <p className="body-medium-regular">אין תורמים עדיין</p>
                <p className="body-small-regular mt-1">
                  היו הראשונים להוסיף ידע ולהופיע כאן!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.topContributors.map((contributor, idx) => (
                  <div
                    key={contributor.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-navy-900"
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
                          className={`absolute -top-1 -end-1 flex items-center justify-center w-5 h-5 rounded-full text-white body-tiny-bold ${medalClasses[idx]}`}
                        >
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body-medium-semibold text-gray-900 dark:text-cream-100 truncate">
                        {contributor.displayName}
                      </p>
                      <p className="body-small-regular text-gray-500 dark:text-gray-400">
                        {contributor.count} פריטי ידע מאושרים
                      </p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen size={12} />
                      <span className="body-small-regular">{contributor.count}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-gray-700 dark:text-gray-300" />
              <CardTitle>ידע שאושר לאחרונה</CardTitle>
            </div>
            <CardDescription>
              פריטי הידע האחרונים שעברו אישור
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentKnowledge.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
                <p className="body-medium-regular">אין פריטי ידע מאושרים עדיין</p>
                <p className="body-small-regular mt-1">
                  התחילו לתעד ופריטים שיאושרו יופיעו כאן
                </p>
              </div>
            ) : (
              <div>
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
                      <div className="flex items-start gap-3 p-3 rounded-xl transition-colors duration-150 cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-900">
                        <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 mt-0.5">
                          <Icon size={16} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="body-medium-semibold text-gray-900 dark:text-cream-100 truncate">
                              {item.title}
                            </p>
                            <Badge variant="outline">
                              <span className="body-tiny-regular">
                                {KNOWLEDGE_TYPE_LABELS[item.itemType as KnowledgeItemType]}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 body-small-regular text-gray-500 dark:text-gray-400">
                            <LtrText>{assetLabel}</LtrText>
                            <span>·</span>
                            <span>{item.author.displayName}</span>
                            <span>·</span>
                            <span>
                              {new Date(item.createdAt).toLocaleDateString("he-IL", {
                                day: "numeric",
                                month: "short",
                              })}
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

export default CoverageDashboard;
