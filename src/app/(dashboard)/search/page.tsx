"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Database, Table2, Columns3, Server, BookOpen } from "lucide-react";
import { LtrText } from "@/components/ltr-text";
import { searchAssets } from "@/app/actions/search";
import { ASSET_TYPE_LABELS } from "@/types/domain";
import type { AssetType } from "@/types/domain";
import { Omnibar } from "@/components/omnibar";

const typeIcons: Record<string, typeof Database> = {
  system: Server,
  schema: Database,
  table: Table2,
  column: Columns3,
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchAssets>>>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const data = await searchAssets(value);
      setResults(data);
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Omnibar />

      <h1 className="text-2xl font-bold mb-6">חיפוש</h1>

      <div className="relative mb-6">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="חיפוש טבלאות, עמודות, ידע..."
          className="pr-9 h-11"
        />
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground text-center py-4">מחפש...</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => {
            const Icon = typeIcons[r.type] ?? Database;
            return (
              <Card
                key={r.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/assets/${r.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
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
                          • {r.hebrewName}
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

      {query.length >= 2 && !isPending && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>לא נמצאו תוצאות עבור &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
