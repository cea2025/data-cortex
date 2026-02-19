"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Database, Table2, Columns3, Server, BookOpen } from "lucide-react";
import { LtrText } from "@/components/ltr-text";
import { Badge } from "@/components/ui/badge";
import { searchAssets } from "@/app/actions/search";
import { useUIStore } from "@/lib/store/ui-store";

const typeIcons = {
  system: Server,
  schema: Database,
  table: Table2,
  column: Columns3,
} as const;

export function Omnibar() {
  const { omnibarOpen, setOmnibarOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchAssets>>>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOmnibarOpen(!omnibarOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [omnibarOpen, setOmnibarOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const data = await searchAssets(query);
      setResults(data);
    });
  }, [query]);

  return (
    <CommandDialog open={omnibarOpen} onOpenChange={setOmnibarOpen}>
      <CommandInput
        placeholder="חיפוש טבלאות, עמודות, ידע... (Ctrl+K)"
        value={query}
        onValueChange={setQuery}
        dir="rtl"
      />
      <CommandList>
        <CommandEmpty>
          {isPending ? "מחפש..." : "לא נמצאו תוצאות"}
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="תוצאות">
            {results.map((r) => {
              const Icon = typeIcons[r.type as keyof typeof typeIcons] ?? Database;
              return (
                <CommandItem
                  key={r.id}
                  onSelect={() => {
                    router.push(`/assets/${r.id}`);
                    setOmnibarOpen(false);
                  }}
                  className="flex items-center gap-3 py-3"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <LtrText className="text-sm font-medium truncate">
                        {r.title}
                      </LtrText>
                      {r.dataType && (
                        <LtrText className="text-xs text-muted-foreground">
                          {r.dataType}
                        </LtrText>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <LtrText className="text-xs text-muted-foreground truncate">
                        {r.subtitle}
                      </LtrText>
                      {r.hebrewName && (
                        <span className="text-xs text-muted-foreground">
                          {r.hebrewName}
                        </span>
                      )}
                    </div>
                  </div>
                  {r.knowledgeCount > 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      <BookOpen className="h-3 w-3 ml-1" />
                      {r.knowledgeCount}
                    </Badge>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
