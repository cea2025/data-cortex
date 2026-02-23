"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
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
import { Badge } from "@/components/ui/badge";
import {
  searchAssetsAndKnowledge,
  type AssetSearchResult,
  type KnowledgeSearchResult,
  type SearchResult,
} from "@/app/actions/search";
import { useUIStore } from "@/lib/store/ui-store";
import { useOrgSlug } from "@/lib/org-context";
import {
  ASSET_TYPE_LABELS,
  KNOWLEDGE_TYPE_LABELS,
  type KnowledgeItemType,
} from "@/types/domain";
import styles from "./Omnibar.module.css";

const assetTypeIcons = {
  system: Server,
  schema: Database,
  table: Table2,
  column: Columns3,
} as const;

const knowledgeTypeIcons: Record<KnowledgeItemType, typeof BookOpen> = {
  business_rule: ScrollText,
  warning: AlertTriangle,
  deprecation: Ban,
  calculation_logic: Calculator,
};

function isAssetResult(r: SearchResult): r is AssetSearchResult {
  return r.type !== "knowledge";
}

function isKnowledgeResult(r: SearchResult): r is KnowledgeSearchResult {
  return r.type === "knowledge";
}

function Omnibar() {
  const { isSearchOpen, setSearchOpen, closeSearch } = useUIStore();
  const orgSlug = useOrgSlug();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isSearchOpen, setSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const debounce = setTimeout(() => {
      startTransition(async () => {
        const data = await searchAssetsAndKnowledge(query, orgSlug);
        setResults(data);
      });
    }, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  const navigateToAsset = useCallback(
    (assetId: string) => {
      router.push(`/${orgSlug}/assets/${assetId}`);
      closeSearch();
    },
    [router, closeSearch, orgSlug]
  );

  const assetResults = results.filter(isAssetResult);
  const knowledgeResults = results.filter(isKnowledgeResult);

  return (
    <CommandDialog
      open={isSearchOpen}
      onOpenChange={setSearchOpen}
      title="חיפוש גלובלי"
      description="חיפוש טבלאות, עמודות וידע ארגוני"
      showCloseButton={false}
    >
      <CommandInput
        placeholder="חיפוש טבלאות, עמודות, ידע ארגוני… (Ctrl+K)"
        value={query}
        onValueChange={setQuery}
        dir="rtl"
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          {isPending
            ? "מחפש…"
            : query.length < 2
              ? "הקלד לפחות 2 תווים לחיפוש"
              : "לא נמצאו תוצאות"}
        </CommandEmpty>

        {assetResults.length > 0 && (
          <CommandGroup heading="נכסי מידע">
            {assetResults.map((r) => {
              const Icon =
                assetTypeIcons[r.type as keyof typeof assetTypeIcons] ??
                Database;
              return (
                <CommandItem
                  key={r.id}
                  value={`${r.title} ${r.hebrewName ?? ""} ${r.subtitle}`}
                  onSelect={() => navigateToAsset(r.id)}
                  className={styles.commandItem}
                >
                  <div className={styles.iconContainer}>
                    <Icon />
                  </div>
                  <div className={styles.contentWrapper}>
                    <div className={styles.titleRow}>
                      <LtrText className={styles.titleText}>
                        {r.title}
                      </LtrText>
                      <Badge variant="outline" className={styles.badgeSmall}>
                        {ASSET_TYPE_LABELS[r.type] ?? r.type}
                      </Badge>
                      {r.dataType && (
                        <LtrText className={styles.dataTypeText}>
                          {r.dataType}
                        </LtrText>
                      )}
                    </div>
                    <div className={styles.subtitleRow}>
                      <LtrText className={styles.subtitleText}>
                        {r.subtitle}
                      </LtrText>
                      {r.hebrewName && (
                        <span className={styles.subtitleText}>
                          · {r.hebrewName}
                        </span>
                      )}
                    </div>
                  </div>
                  {r.knowledgeCount > 0 && (
                    <Badge variant="secondary" className={styles.badgeKnowledgeCount}>
                      <BookOpen className="h-3 w-3" />
                      {r.knowledgeCount}
                    </Badge>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {assetResults.length > 0 && knowledgeResults.length > 0 && (
          <CommandSeparator />
        )}

        {knowledgeResults.length > 0 && (
          <CommandGroup heading="ידע ארגוני">
            {knowledgeResults.map((r) => {
              const Icon =
                knowledgeTypeIcons[r.knowledgeType] ?? BookOpen;
              return (
                <CommandItem
                  key={r.id}
                  value={`${r.title} ${r.snippet} ${r.assetPath}`}
                  onSelect={() => navigateToAsset(r.assetId)}
                  className={styles.commandItem}
                >
                  <div className={styles.knowledgeIconContainer}>
                    <Icon />
                  </div>
                  <div className={styles.contentWrapper}>
                    <div className={styles.titleRow}>
                      <span className={styles.titleText}>
                        {r.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${styles.badgeSmall} ${styles.badgeKnowledge}`}
                      >
                        {KNOWLEDGE_TYPE_LABELS[r.knowledgeType]}
                      </Badge>
                    </div>
                    <p className={styles.snippetText}>
                      {r.snippet}
                    </p>
                    <LtrText className={styles.assetPathText}>
                      {r.assetPath}
                    </LtrText>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export default Omnibar;
