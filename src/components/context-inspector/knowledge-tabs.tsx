"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { KnowledgeItemCard } from "@/components/knowledge/item-card";
import { AIEvidencePanel } from "@/components/context-inspector/ai-evidence";
import { ContributeForm } from "@/components/knowledge/contribute-form";
import {
  BookOpen,
  AlertTriangle,
  Calculator,
  Ban,
  Cpu,
  Lightbulb,
  Plus,
} from "lucide-react";
import type { AssetWithKnowledge } from "@/app/actions/assets";

export function KnowledgeTabs({ asset }: { asset: AssetWithKnowledge }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  const directItems = asset.knowledgeItems;
  const childItems = asset.childKnowledgeItems ?? [];
  const allItems = [...directItems, ...childItems];

  const businessRules = allItems.filter((i) => i.itemType === "business_rule");
  const warnings = allItems.filter((i) => i.itemType === "warning");
  const calculations = allItems.filter(
    (i) => i.itemType === "calculation_logic"
  );
  const deprecations = allItems.filter((i) => i.itemType === "deprecation");

  const totalKnowledge = allItems.length;

  const defaultTab =
    warnings.length > 0
      ? "warning"
      : businessRules.length > 0
        ? "business_rule"
        : calculations.length > 0
          ? "calculation"
          : deprecations.length > 0
            ? "deprecation"
            : "business_rule";

  const assetLabel =
    asset.columnName ??
    asset.tableName ??
    asset.schemaName ??
    asset.systemName;

  return (
    <div className="flex flex-col h-full border-r border-border" dir="rtl">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold">ידע ארגוני</h2>
          {totalKnowledge > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalKnowledge} פריטים
            </span>
          )}
          <Button
            variant="default"
            size="sm"
            className="mr-auto gap-1.5 text-xs"
            onClick={() => setSheetOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            הוסף ידע
          </Button>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="flex flex-col flex-1 min-h-0">
        <div className="border-b border-border px-3 pt-1 bg-card">
          <TabsList className="w-full justify-start gap-0.5 bg-transparent h-auto p-0">
            <TabButton value="business_rule" count={businessRules.length}>
              <BookOpen className="h-3.5 w-3.5" />
              כללים
            </TabButton>
            <TabButton value="warning" count={warnings.length}>
              <AlertTriangle className="h-3.5 w-3.5" />
              אזהרות
            </TabButton>
            <TabButton value="calculation" count={calculations.length}>
              <Calculator className="h-3.5 w-3.5" />
              חישובים
            </TabButton>
            <TabButton value="deprecation" count={deprecations.length}>
              <Ban className="h-3.5 w-3.5" />
              משומש
            </TabButton>
            <TabButton value="ai" count={asset.aiInsights.length}>
              <Cpu className="h-3.5 w-3.5" />
              AI
            </TabButton>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="business_rule" className="p-4 space-y-3 mt-0">
            {businessRules.length === 0 ? (
              <EmptyState icon={BookOpen} label="אין כללים עסקיים" />
            ) : (
              businessRules.map((item) => (
                <KnowledgeItemCard key={item.id} item={item} />
              ))
            )}
          </TabsContent>

          <TabsContent value="warning" className="p-4 space-y-3 mt-0">
            {warnings.length === 0 ? (
              <EmptyState icon={AlertTriangle} label="אין אזהרות" />
            ) : (
              warnings.map((item) => (
                <KnowledgeItemCard key={item.id} item={item} />
              ))
            )}
          </TabsContent>

          <TabsContent value="calculation" className="p-4 space-y-3 mt-0">
            {calculations.length === 0 ? (
              <EmptyState icon={Calculator} label="אין לוגיקת חישוב" />
            ) : (
              calculations.map((item) => (
                <KnowledgeItemCard key={item.id} item={item} />
              ))
            )}
          </TabsContent>

          <TabsContent value="deprecation" className="p-4 space-y-3 mt-0">
            {deprecations.length === 0 ? (
              <EmptyState icon={Ban} label="אין פריטים שהוצאו משימוש" />
            ) : (
              deprecations.map((item) => (
                <KnowledgeItemCard key={item.id} item={item} />
              ))
            )}
          </TabsContent>

          <TabsContent value="ai" className="p-4 space-y-3 mt-0">
            <AIEvidencePanel
              insights={asset.aiInsights}
              assetId={asset.id}
              hasApprovedKnowledge={allItems.some((i) => i.status === "approved")}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Contribute Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto" dir="rtl">
          <SheetHeader>
            <SheetTitle>הוספת פריט ידע</SheetTitle>
            <SheetDescription>
              הוסף כלל עסקי, אזהרה או תיעוד עבור הנכס הזה. הפריט יישלח לאישור הבעלים.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <ContributeForm
              fixedAssetId={asset.id}
              fixedAssetLabel={assetLabel}
              onSuccess={() => {
                setSheetOpen(false);
                router.refresh();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TabButton({
  value,
  count,
  children,
}: {
  value: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className="gap-1 text-xs px-2.5 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
    >
      {children}
      {count > 0 && (
        <span className="bg-muted rounded-full px-1.5 text-[10px] min-w-4 text-center">
          {count}
        </span>
      )}
    </TabsTrigger>
  );
}

function EmptyState({
  icon: Icon,
  label,
}: {
  icon: typeof BookOpen;
  label: string;
}) {
  return (
    <div className="text-center py-10 text-muted-foreground">
      <Icon className="h-8 w-8 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
