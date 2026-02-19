"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KnowledgeItemCard } from "@/components/knowledge/item-card";
import { AIEvidencePanel } from "@/components/context-inspector/ai-evidence";
import { BookOpen, AlertTriangle, Cpu, Archive } from "lucide-react";
import type { getAssetById } from "@/app/actions/assets";

type Asset = NonNullable<Awaited<ReturnType<typeof getAssetById>>>;

export function KnowledgeTabs({ asset }: { asset: Asset }) {
  const items = asset.knowledgeItems;
  const businessRules = items.filter((i) => i.itemType === "business_rule");
  const warnings = items.filter((i) => i.itemType === "warning");
  const calculations = items.filter((i) => i.itemType === "calculation_logic");
  const deprecations = items.filter((i) => i.itemType === "deprecation");

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Tabs defaultValue="business_rule" className="flex flex-col h-full">
        <div className="border-b border-border px-4 pt-2">
          <TabsList className="w-full justify-start gap-1 bg-transparent">
            <TabsTrigger value="business_rule" className="gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              כללים ({businessRules.length})
            </TabsTrigger>
            <TabsTrigger value="warning" className="gap-1.5 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              אזהרות ({warnings.length})
            </TabsTrigger>
            <TabsTrigger value="calculation" className="gap-1.5 text-xs">
              <Cpu className="h-3.5 w-3.5" />
              חישובים ({calculations.length})
            </TabsTrigger>
            <TabsTrigger value="deprecation" className="gap-1.5 text-xs">
              <Archive className="h-3.5 w-3.5" />
              הוצא משימוש ({deprecations.length})
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5 text-xs">
              <Cpu className="h-3.5 w-3.5" />
              AI ({asset.aiInsights.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="business_rule" className="p-4 space-y-3 mt-0">
            {businessRules.length === 0 ? (
              <EmptyState label="אין כללים עסקיים" />
            ) : (
              businessRules.map((item) => (
                <KnowledgeItemCard key={item.id} item={item} />
              ))
            )}
          </TabsContent>

          <TabsContent value="warning" className="p-4 space-y-3 mt-0">
            {warnings.length === 0 ? (
              <EmptyState label="אין אזהרות" />
            ) : (
              warnings.map((item) => (
                <KnowledgeItemCard key={item.id} item={item} />
              ))
            )}
          </TabsContent>

          <TabsContent value="calculation" className="p-4 space-y-3 mt-0">
            {calculations.length === 0 ? (
              <EmptyState label="אין לוגיקת חישוב" />
            ) : (
              calculations.map((item) => (
                <KnowledgeItemCard key={item.id} item={item} />
              ))
            )}
          </TabsContent>

          <TabsContent value="deprecation" className="p-4 space-y-3 mt-0">
            {deprecations.length === 0 ? (
              <EmptyState label="אין פריטים שהוצאו משימוש" />
            ) : (
              deprecations.map((item) => (
                <KnowledgeItemCard key={item.id} item={item} />
              ))
            )}
          </TabsContent>

          <TabsContent value="ai" className="p-4 space-y-3 mt-0">
            <AIEvidencePanel insights={asset.aiInsights} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground text-sm">
      {label}
    </div>
  );
}
