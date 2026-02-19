"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LtrText } from "@/components/ltr-text";
import { createKnowledgeItem } from "@/app/actions/knowledge";
import { KNOWLEDGE_TYPE_LABELS } from "@/types/domain";
import { toast } from "sonner";

interface TableAsset {
  id: string;
  tableName: string | null;
  hebrewName: string | null;
  systemName: string;
  schemaName: string | null;
  children?: { id: string; columnName: string | null; hebrewName: string | null }[];
}

export function ContributeForm({
  tables,
}: {
  tables: (TableAsset & { _count: { knowledgeItems: number; children: number } })[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [itemType, setItemType] = useState("");
  const [title, setTitle] = useState("");
  const [contentHebrew, setContentHebrew] = useState("");
  const [contentEnglish, setContentEnglish] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !itemType || !title) {
      toast.error("נא למלא את כל השדות הנדרשים");
      return;
    }

    startTransition(async () => {
      try {
        await createKnowledgeItem({
          dataAssetId: selectedAssetId,
          authorId: "demo-user-id",
          title,
          itemType: itemType as "business_rule" | "warning" | "deprecation" | "calculation_logic",
          contentHebrew: contentHebrew || undefined,
          contentEnglish: contentEnglish || undefined,
        });
        toast.success("פריט הידע נוצר בהצלחה ונשלח לבדיקה");
        router.push(`/assets/${selectedAssetId}`);
      } catch {
        toast.error("שגיאה ביצירת פריט הידע");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>פרטי הידע</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Table Selection */}
          <div className="space-y-2">
            <Label>טבלה *</Label>
            <Select
              value={selectedTable}
              onValueChange={(v) => {
                setSelectedTable(v);
                setSelectedAssetId(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר טבלה..." />
              </SelectTrigger>
              <SelectContent>
                {tables.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <LtrText className="text-sm">{t.tableName}</LtrText>
                      <span className="text-xs text-muted-foreground">
                        {t.hebrewName}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Knowledge Type */}
          <div className="space-y-2">
            <Label>סוג ידע *</Label>
            <Select value={itemType} onValueChange={setItemType}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(KNOWLEDGE_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>כותרת *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="כותרת קצרה ומתארת"
              required
            />
          </div>

          {/* Hebrew Content */}
          <div className="space-y-2">
            <Label>תוכן בעברית</Label>
            <Textarea
              value={contentHebrew}
              onChange={(e) => setContentHebrew(e.target.value)}
              placeholder="תיאור מפורט בעברית..."
              rows={4}
            />
          </div>

          {/* English Content */}
          <div className="space-y-2">
            <Label>Content in English</Label>
            <Textarea
              value={contentEnglish}
              onChange={(e) => setContentEnglish(e.target.value)}
              placeholder="Detailed description in English..."
              rows={4}
              dir="ltr"
              className="text-left font-mono"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "שולח..." : "שלח לבדיקה"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
