"use client";

import { useState, useTransition } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import KnowledgeItemCard from "@/components/knowledge/item-card";
import { AIEvidencePanel } from "@/components/context-inspector/ai-evidence";
import RelationshipsTab from "@/components/context-inspector/relationships-tab";
import ContributeForm from "@/components/knowledge/contribute-form";
import { submitBulkKnowledge } from "@/app/actions/knowledge";
import { useOrgSlug } from "@/lib/org-context";
import { toast } from "sonner";
import {
  BookOpen,
  AlertTriangle,
  Calculator,
  Ban,
  Cpu,
  Lightbulb,
  ArrowLeftRight,
  Plus,
  Crown,
  GitBranch,
  Loader2,
} from "lucide-react";
import type { AssetWithKnowledge } from "@/app/actions/assets";

type TopTab = "knowledge" | "relationships" | "lineage";

function KnowledgeTabs({ asset }: { asset: AssetWithKnowledge }) {
  const router = useRouter();
  const orgSlug = useOrgSlug();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetIsCanonical, setSheetIsCanonical] = useState(false);
  const [topTab, setTopTab] = useState<TopTab>("knowledge");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkDuplicates, setBulkDuplicates] = useState<
    { id: string; tableName: string | null }[]
  >([]);
  const [lastDraftData, setLastDraftData] = useState<{
    title: string;
    itemType: string;
    contentHebrew?: string;
    contentEnglish?: string;
  } | null>(null);
  const [isBulkPending, startBulkTransition] = useTransition();

  const directItems = asset.knowledgeItems;
  const childItems = asset.childKnowledgeItems ?? [];
  const allItems = [...directItems, ...childItems];

  const canonicalItems = allItems.filter((i) => i.isCanonical);
  const communityItems = allItems
    .filter((i) => !i.isCanonical)
    .sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));

  const businessRules = communityItems.filter((i) => i.itemType === "business_rule");
  const warnings = communityItems.filter((i) => i.itemType === "warning");
  const calculations = communityItems.filter((i) => i.itemType === "calculation_logic");
  const deprecations = communityItems.filter((i) => i.itemType === "deprecation");

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

  const handleProposeCanonical = () => {
    setSheetIsCanonical(true);
    setSheetOpen(true);
  };

  const handleAddKnowledge = () => {
    setSheetIsCanonical(false);
    setSheetOpen(true);
  };

  const handleBulkApply = () => {
    if (!lastDraftData) return;
    startBulkTransition(async () => {
      try {
        const result = await submitBulkKnowledge({
          title: lastDraftData.title,
          itemType: lastDraftData.itemType as "business_rule" | "warning" | "deprecation" | "calculation_logic",
          contentHebrew: lastDraftData.contentHebrew,
          contentEnglish: lastDraftData.contentEnglish,
          assetIds: bulkDuplicates.map((d) => d.id),
          orgSlug,
        });
        toast.success(`הגדרה רשמית הוחלה על ${result.count} עמודות נוספות`);
        setBulkDialogOpen(false);
        router.refresh();
      } catch {
        toast.error("שגיאה בהחלה המרובה");
      }
    });
  };

  const LineageGraph = topTab === "lineage"
    ? require("@/components/context-inspector/lineage-graph").default
    : null;

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Top-level section switcher */}
      <div className="flex items-center gap-1 px-3 py-2 border-b">
        <button
          onClick={() => setTopTab("knowledge")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
            topTab === "knowledge"
              ? "bg-gold-100 text-gold-700"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          ידע ארגוני
          {totalKnowledge > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-current/10 text-[10px]">{totalKnowledge}</span>
          )}
        </button>
        <button
          onClick={() => setTopTab("relationships")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
            topTab === "relationships"
              ? "bg-teal-100 text-teal-700"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          קשרי גומלין
        </button>
        <button
          onClick={() => setTopTab("lineage")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
            topTab === "lineage"
              ? "bg-navy-100 text-navy-700"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <GitBranch className="h-3.5 w-3.5" />
          לינג׳ ויזואלי
        </button>
      </div>

      {topTab === "knowledge" ? (
        <>
          {/* Canonical Definition Section */}
          <div className="mx-4 mt-4 mb-2 p-5 rounded-2xl border-2 border-teal-300 bg-gradient-to-r from-teal-50 to-gold-50/30 dark:from-teal-950/30 dark:to-gold-950/10 dark:border-teal-700">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 mb-3 text-base font-bold">
              <Crown className="h-4 w-4" />
              הגדרה רשמית
            </div>
            {canonicalItems.length > 0 ? (
              <div className="flex flex-col gap-3 p-4">
                {canonicalItems.map((item) => (
                  <KnowledgeItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <button
                className="w-full py-3 rounded-xl border-2 border-dashed border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400 transition-colors flex items-center justify-center gap-2 font-semibold"
                onClick={handleProposeCanonical}
              >
                <Crown className="h-4 w-4" />
                הצע הגדרה רשמית
              </button>
            )}
          </div>

          {/* Community Notes header */}
          <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
            <span>הערות קהילתיות ({communityItems.length})</span>
          </div>

          {/* Knowledge panel header */}
          <div className="px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h2 className="body-medium-semibold">ידע ארגוני</h2>
              <Button
                variant="default"
                size="sm"
                className="mr-auto gap-1.5"
                onClick={handleAddKnowledge}
              >
                <Plus className="h-3.5 w-3.5" />
                הוסף ידע
              </Button>
            </div>
          </div>

          <Tabs defaultValue={defaultTab} className="flex flex-col flex-1 min-h-0">
            <div className="px-4 py-2 border-b">
              <TabsList variant="line">
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
              <TabsContent value="business_rule" className="p-0">
                <div className="flex flex-col gap-3 p-4">
                  {businessRules.length === 0 ? (
                    <EmptyState icon={BookOpen} label="אין כללים עסקיים" />
                  ) : (
                    businessRules.map((item) => (
                      <KnowledgeItemCard key={item.id} item={item} />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="warning" className="p-0">
                <div className="flex flex-col gap-3 p-4">
                  {warnings.length === 0 ? (
                    <EmptyState icon={AlertTriangle} label="אין אזהרות" />
                  ) : (
                    warnings.map((item) => (
                      <KnowledgeItemCard key={item.id} item={item} />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="calculation" className="p-0">
                <div className="flex flex-col gap-3 p-4">
                  {calculations.length === 0 ? (
                    <EmptyState icon={Calculator} label="אין לוגיקת חישוב" />
                  ) : (
                    calculations.map((item) => (
                      <KnowledgeItemCard key={item.id} item={item} />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="deprecation" className="p-0">
                <div className="flex flex-col gap-3 p-4">
                  {deprecations.length === 0 ? (
                    <EmptyState icon={Ban} label="אין פריטים שהוצאו משימוש" />
                  ) : (
                    deprecations.map((item) => (
                      <KnowledgeItemCard key={item.id} item={item} />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ai" className="p-0">
                <div className="flex flex-col gap-3 p-4">
                  <AIEvidencePanel
                    insights={asset.aiInsights}
                    assetId={asset.id}
                    hasApprovedKnowledge={allItems.some(
                      (i) => i.status === "approved"
                    )}
                  />
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </>
      ) : topTab === "relationships" ? (
        <RelationshipsTab assetId={asset.id} assetLabel={assetLabel} />
      ) : (
        LineageGraph && <LineageGraph assetId={asset.id} assetLabel={assetLabel} />
      )}

      {/* Contribute Sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSheetIsCanonical(false);
        }}
      >
        <SheetContent side="left" className="w-full sm:max-w-xl" dir="rtl">
          <SheetHeader>
            <SheetTitle>
              {sheetIsCanonical ? "הצע הגדרה רשמית" : "הוספת פריט ידע"}
            </SheetTitle>
            <SheetDescription>
              {sheetIsCanonical
                ? "הגדרה רשמית היא ההגדרה המקובלת בארגון עבור נכס זה. היא תופיע בראש הדף."
                : "הוסף כלל עסקי, אזהרה או תיעוד עבור הנכס הזה. הפריט יישלח לאישור הבעלים."}
            </SheetDescription>
          </SheetHeader>
          <div className="p-4">
            <ContributeForm
              fixedAssetId={asset.id}
              fixedAssetLabel={assetLabel}
              isCanonical={sheetIsCanonical}
              onSuccess={(draftData) => {
                setSheetOpen(false);
                if (
                  draftData?.suggestBulk &&
                  draftData.duplicateAssets &&
                  draftData.duplicateAssets.length > 0
                ) {
                  setBulkDuplicates(draftData.duplicateAssets);
                  setLastDraftData({
                    title: draftData.title,
                    itemType: draftData.itemType,
                    contentHebrew: draftData.contentHebrew,
                    contentEnglish: draftData.contentEnglish,
                  });
                  setBulkDialogOpen(true);
                } else {
                  router.refresh();
                }
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Bulk Apply Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>החלת הגדרה רשמית על עמודות נוספות</DialogTitle>
            <DialogDescription>
              מצאנו {bulkDuplicates.length} עמודות נוספות בשם{" "}
              <strong>{asset.columnName}</strong> ללא הגדרה רשמית. האם להחיל
              את ההגדרה גם עליהן?
            </DialogDescription>
          </DialogHeader>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="body-small-semibold">טבלה</th>
              </tr>
            </thead>
            <tbody>
              {bulkDuplicates.map((d) => (
                <tr key={d.id}>
                  <td className="body-small-regular">{d.tableName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setBulkDialogOpen(false)}
              disabled={isBulkPending}
            >
              לא תודה
            </Button>
            <Button onClick={handleBulkApply} disabled={isBulkPending} className="gap-1.5">
              {isBulkPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              החל על {bulkDuplicates.length} עמודות
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
    <TabsTrigger value={value} className="gap-1.5 body-small-semibold">
      {children}
      {count > 0 && (
        <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-current/10 text-[10px]">{count}</span>
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
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Icon className="h-8 w-8 opacity-20 mb-2" />
      <p className="body-medium-regular">{label}</p>
    </div>
  );
}

export default KnowledgeTabs;
