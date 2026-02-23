"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="heading-h2-bold text-foreground">חיפוש</h1>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="חיפוש טבלאות, עמודות, ידע…"
          className="pr-9 h-11"
        />
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground text-center">
          מחפש…
        </p>
      )}

      {assets.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="heading-h3-bold mb-1">נכסי מידע</h2>
          {assets.map((r) => {
            const Icon = assetIcons[r.type] ?? Database;
            return (
              <Card
                key={r.id}
                className="transition-colors hover:bg-accent/30 cursor-pointer"
                onClick={() => router.push(`/${orgSlug}/assets/${r.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <LtrText className="font-medium">{r.title}</LtrText>
                      {r.dataType && (
                        <LtrText className="text-xs text-muted-foreground">
                          {r.dataType}
                        </LtrText>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
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
                  <div className="flex items-center gap-2 shrink-0">
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
        <div className="flex flex-col gap-2">
          <h2 className="heading-h3-bold mb-1">ידע ארגוני</h2>
          {knowledge.map((r) => {
            const Icon = knowledgeIcons[r.knowledgeType] ?? BookOpen;
            return (
              <Card
                key={r.id}
                className="transition-colors hover:bg-accent/30 cursor-pointer border-gold-200/50"
                onClick={() => router.push(`/${orgSlug}/assets/${r.assetId}`)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-100">
                    <Icon className="h-4 w-4 text-gold-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.title}</span>
                      <Badge
                        variant="outline"
                        className="text-xs border-gold-300 text-gold-600"
                      >
                        {KNOWLEDGE_TYPE_LABELS[r.knowledgeType]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
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
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>לא נמצאו תוצאות עבור &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
