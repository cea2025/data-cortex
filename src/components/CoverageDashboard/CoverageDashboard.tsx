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
import styles from "./CoverageDashboard.module.css";

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

const medalClasses = [styles.medalGold, styles.medalSilver, styles.medalBronze];

function CoverageDashboard({ stats }: { stats: DashboardStats }) {
  const { openSearch } = useUIStore();
  const orgSlug = useOrgSlug();

  return (
    <div className={styles.container} dir="rtl">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={`${styles.headerTitle} heading-h1-bold`}>Data Cortex</h1>
          <p className={`${styles.headerSubtitle} body-medium-regular`}>
            לוח בקרה — כיסוי תיעוד מטא-דאטה
          </p>
        </div>
        <Button
          variant="outline"
          className={styles.searchTrigger}
          onClick={openSearch}
        >
          <Search size={16} />
          <span className="body-medium-regular">חיפוש...</span>
          <kbd className={`${styles.searchKbd} body-tiny-regular`}>
            <span>Ctrl</span>K
          </kbd>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <Card className={`${styles.kpiCard} ${styles.kpiCardTeal}`}>
          <CardHeader className={styles.kpiHeader}>
            <CardTitle className="body-medium-semibold">טבלאות</CardTitle>
            <div className={`${styles.kpiIconWrap} ${styles.kpiIconTeal}`}>
              <Table2 size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`${styles.kpiValue} heading-h1-bold`}>
              {formatNumber(stats.totalTables)}
            </div>
            <p className={`${styles.kpiMeta} body-small-regular`}>
              ב-{stats.systemBreakdown.length} מערכות
            </p>
          </CardContent>
        </Card>

        <Card className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
          <CardHeader className={styles.kpiHeader}>
            <CardTitle className="body-medium-semibold">עמודות</CardTitle>
            <div className={`${styles.kpiIconWrap} ${styles.kpiIconBlue}`}>
              <Columns3 size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`${styles.kpiValue} heading-h1-bold`}>
              {formatNumber(stats.totalColumns)}
            </div>
            <p className={`${styles.kpiMeta} body-small-regular`}>
              עמודות ממופות
            </p>
          </CardContent>
        </Card>

        <Card className={`${styles.kpiCard} ${styles.kpiCardEmerald}`}>
          <CardHeader className={styles.kpiHeader}>
            <CardTitle className="body-medium-semibold">פריטי ידע מאושרים</CardTitle>
            <div className={`${styles.kpiIconWrap} ${styles.kpiIconEmerald}`}>
              <BookOpen size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`${styles.kpiValue} heading-h1-bold`}>
              {formatNumber(stats.totalKnowledgeItems)}
            </div>
            <p className={`${styles.kpiMeta} body-small-regular`}>
              {stats.documentedAssetsCount} נכסים מתועדים
            </p>
          </CardContent>
        </Card>

        <Card className={`${styles.kpiCard} ${styles.kpiCardAmber}`}>
          <CardHeader className={styles.kpiHeader}>
            <CardTitle className="body-medium-semibold">כיסוי תיעוד</CardTitle>
            <div className={`${styles.kpiIconWrap} ${styles.kpiIconAmber}`}>
              <Target size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`${styles.kpiValue} heading-h1-bold`}>
              {stats.coveragePercentage}%
            </div>
            <p className={`${styles.kpiMeta} body-small-regular`}>
              מתוך {formatNumber(stats.totalTables + stats.totalColumns)} נכסים
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Progress + System Breakdown */}
      <div className={styles.middleGrid}>
        <Card>
          <CardHeader>
            <div className={styles.cardTitleRow}>
              <TrendingUp size={20} className={styles.cardTitleIcon} />
              <CardTitle>התקדמות כיסוי תיעוד</CardTitle>
            </div>
            <CardDescription>
              כמה מהנכסים (טבלאות + עמודות) מתועדים עם לפחות פריט ידע מאושר אחד
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.coverageStats}>
              <div className={styles.coverageRow}>
                <span className={`${styles.coverageBarLabel} body-medium-semibold`}>כיסוי כולל</span>
                <span className={`${styles.coverageBarValue} heading-h2-bold`}>
                  {stats.coveragePercentage}%
                </span>
              </div>
              <Progress
                value={stats.coveragePercentage}
                className="h-4 [&>[data-slot=progress-indicator]]:bg-gradient-to-l [&>[data-slot=progress-indicator]]:from-teal-500 [&>[data-slot=progress-indicator]]:to-emerald-500"
              />
              <div className={styles.coverageRow}>
                <span className="body-small-regular" style={{ color: "var(--font-secondary-default)" }}>
                  {formatNumber(stats.documentedAssetsCount)} מתועדים
                </span>
                <span className="body-small-regular" style={{ color: "var(--font-secondary-default)" }}>
                  {formatNumber(stats.totalTables + stats.totalColumns - stats.documentedAssetsCount)} ממתינים לתיעוד
                </span>
              </div>
            </div>

            <div className={styles.ctaBanner}>
              <Sparkles size={20} className={styles.ctaIcon} />
              <div className={styles.ctaContent}>
                <p className={`${styles.ctaTitle} body-medium-semibold`}>עזרו לנו לתעד!</p>
                <p className={`${styles.ctaSubtitle} body-small-regular`}>
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

        <Card>
          <CardHeader>
            <div className={styles.cardTitleRow}>
              <Database size={20} className={styles.cardTitleIcon} />
              <CardTitle>מערכות</CardTitle>
            </div>
            <CardDescription>פילוח טבלאות לפי מערכת מקור</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
              {stats.systemBreakdown.map((system) => {
                const pct =
                  stats.totalTables > 0
                    ? Math.round((system.tableCount / stats.totalTables) * 100)
                    : 0;
                return (
                  <div key={system.systemName} className={styles.systemBreakdownItem}>
                    <div className={styles.systemBreakdownRow}>
                      <LtrText className={`${styles.systemName} body-medium-semibold`}>
                        {system.systemName}
                      </LtrText>
                      <span className={`${styles.systemCount} body-small-regular`}>
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
      <div className={styles.bottomGrid}>
        <Card>
          <CardHeader>
            <div className={styles.cardTitleRow}>
              <Trophy size={20} className={styles.cardTitleIconAmber} />
              <CardTitle>תורמים מובילים</CardTitle>
            </div>
            <CardDescription>
              המשתמשים עם הכי הרבה פריטי ידע מאושרים
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topContributors.length === 0 ? (
              <div className={styles.emptyState}>
                <Trophy size={40} className={styles.emptyIcon} />
                <p className="body-medium-regular">אין תורמים עדיין</p>
                <p className="body-small-regular" style={{ marginTop: "var(--space-xs)" }}>
                  היו הראשונים להוסיף ידע ולהופיע כאן!
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                {stats.topContributors.map((contributor, idx) => (
                  <div key={contributor.id} className={styles.contributorRow}>
                    <div className={styles.contributorAvatar}>
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
                        <div className={`${styles.medal} ${medalClasses[idx]} body-tiny-bold`}>
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className={styles.contributorInfo}>
                      <p className={`${styles.contributorName} body-medium-semibold`}>
                        {contributor.displayName}
                      </p>
                      <p className={`${styles.contributorCount} body-small-regular`}>
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

        <Card>
          <CardHeader>
            <div className={styles.cardTitleRow}>
              <Clock size={20} className={styles.cardTitleIcon} />
              <CardTitle>ידע שאושר לאחרונה</CardTitle>
            </div>
            <CardDescription>
              פריטי הידע האחרונים שעברו אישור
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentKnowledge.length === 0 ? (
              <div className={styles.emptyState}>
                <BookOpen size={40} className={styles.emptyIcon} />
                <p className="body-medium-regular">אין פריטי ידע מאושרים עדיין</p>
                <p className="body-small-regular" style={{ marginTop: "var(--space-xs)" }}>
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
                      <div className={styles.knowledgeFeedItem}>
                        <div className={styles.feedIconWrap}>
                          <Icon size={16} className={styles.feedIcon} />
                        </div>
                        <div className={styles.feedContent}>
                          <div className={styles.feedTitleRow}>
                            <p className={`${styles.feedTitle} body-medium-semibold`}>
                              {item.title}
                            </p>
                            <Badge variant="outline">
                              <span className="body-tiny-regular">
                                {KNOWLEDGE_TYPE_LABELS[item.itemType as KnowledgeItemType]}
                              </span>
                            </Badge>
                          </div>
                          <div className={`${styles.feedMeta} body-small-regular`}>
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
