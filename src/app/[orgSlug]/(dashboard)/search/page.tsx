"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import styles from "./SearchPage.module.css";
import {
  Search,
  Database,
  Table2,
  Columns3,
  Server,
  BookOpen,
  AlertTriangle,
  Ban,
  Calculator,
  ScrollText,
} from "lucide-react";
import { LtrText } from "@/components/ltr-text";
import {
  searchAssetsAndKnowledge,
  type SearchResult,
  type AssetSearchResult,
  type KnowledgeSearchResult,
} from "@/app/actions/search";
import { ASSET_TYPE_LABELS, KNOWLEDGE_TYPE_LABELS } from "@/types/domain";
import type { AssetType, KnowledgeItemType } from "@/types/domain";
import { useOrgSlug } from "@/lib/org-context";

const assetIcons: Record<string, typeof Database> = {
  system: Server,
  schema: Database,
  table: Table2,
  column: Columns3,
};

const knowledgeIcons: Record<KnowledgeItemType, typeof BookOpen> = {
  business_rule: ScrollText,
  warning: AlertTriangle,
  deprecation: Ban,
  calculation_logic: Calculator,
};

function isAsset(r: SearchResult): r is AssetSearchResult {
  return r.type !== "knowledge";
}

function isKnowledge(r: SearchResult): r is KnowledgeSearchResult {
  return r.type === "knowledge";
}

export default function SearchPage() {
  const router = useRouter();
  const orgSlug = useOrgSlug();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const data = await searchAssetsAndKnowledge(value, orgSlug);
      setResults(data);
    });
  };

  const assets = results.filter(isAsset);
  const knowledge = results.filter(isKnowledge);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>חיפוש</h1>

      <div className={styles.inputWrapper}>
        <Search className={styles.searchIcon} />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="חיפוש טבלאות, עמודות, ידע…"
          className="pr-9 h-11"
        />
      </div>

      {isPending && (
        <p className={styles.pendingText}>
          מחפש…
        </p>
      )}

      {assets.length > 0 && (
        <div className={styles.resultsSection}>
          <h2 className={styles.sectionTitle}>נכסי מידע</h2>
          {assets.map((r) => {
            const Icon = assetIcons[r.type] ?? Database;
            return (
              <Card
                key={r.id}
                className={styles.card}
                onClick={() => router.push(`/${orgSlug}/assets/${r.id}`)}
              >
                <CardContent className={styles.cardContent}>
                  <div className={styles.iconWrap}>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitleRow}>
                      <LtrText className="font-medium">{r.title}</LtrText>
                      {r.dataType && (
                        <LtrText className="text-xs text-muted-foreground">
                          {r.dataType}
                        </LtrText>
                      )}
                    </div>
                    <div className={styles.cardSubtitleRow}>
                      <LtrText className="text-xs text-muted-foreground">
                        {r.subtitle}
                      </LtrText>
                      {r.hebrewName && (
                        <span className="text-xs text-muted-foreground">
                          · {r.hebrewName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.cardBadges}>
                    <Badge variant="outline" className="text-xs">
                      {ASSET_TYPE_LABELS[r.type as AssetType]}
                    </Badge>
                    {r.knowledgeCount > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <BookOpen className="h-3 w-3" />
                        {r.knowledgeCount}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {knowledge.length > 0 && (
        <div className={styles.resultsSectionLast}>
          <h2 className={styles.sectionTitle}>ידע ארגוני</h2>
          {knowledge.map((r) => {
            const Icon = knowledgeIcons[r.knowledgeType] ?? BookOpen;
            return (
              <Card
                key={r.id}
                className={styles.cardKnowledge}
                onClick={() => router.push(`/${orgSlug}/assets/${r.assetId}`)}
              >
                <CardContent className={styles.cardContent}>
                  <div className={styles.iconWrapKnowledge}>
                    <Icon className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitleRow}>
                      <span className="font-medium">{r.title}</span>
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-500/30 text-amber-500"
                      >
                        {KNOWLEDGE_TYPE_LABELS[r.knowledgeType]}
                      </Badge>
                    </div>
                    <p className={styles.snippet}>
                      {r.snippet}
                    </p>
                    <LtrText className="text-[11px] text-muted-foreground/60 mt-1">
                      {r.assetPath}
                    </LtrText>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {query.length >= 2 && !isPending && results.length === 0 && (
        <div className={styles.emptyState}>
          <Search className={styles.emptyIcon} />
          <p>לא נמצאו תוצאות עבור &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
