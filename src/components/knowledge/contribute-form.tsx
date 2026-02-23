"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
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
import { LtrText } from "@/components/ltr-text";
import { submitKnowledgeDraft } from "@/app/actions/knowledge";
import { KNOWLEDGE_TYPE_LABELS } from "@/types/domain";
import { useOrgSlug } from "@/lib/org-context";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

// ─── Zod Schema ─────────────────────────────────────────────────

const contributeSchema = z.object({
  dataAssetId: z.string().uuid("נא לבחור נכס מידע"),
  itemType: z.enum(
    ["business_rule", "warning", "deprecation", "calculation_logic"],
    { errorMap: () => ({ message: "נא לבחור סוג ידע" }) }
  ),
  title: z
    .string()
    .min(3, "כותרת חייבת להכיל לפחות 3 תווים")
    .max(200, "כותרת ארוכה מדי"),
  contentHebrew: z.string().optional(),
  contentEnglish: z.string().optional(),
}).refine(
  (data) => (data.contentHebrew?.trim() || data.contentEnglish?.trim()),
  { message: "נדרש תוכן בעברית או באנגלית", path: ["contentHebrew"] }
);

type ContributeFormData = z.infer<typeof contributeSchema>;

// ─── Types ──────────────────────────────────────────────────────

interface TableAsset {
  id: string;
  tableName: string | null;
  hebrewName: string | null;
  systemName: string;
  schemaName: string | null;
  children?: {
    id: string;
    columnName: string | null;
    hebrewName: string | null;
  }[];
}

type TableWithCounts = TableAsset & {
  _count: { knowledgeItems: number; children: number };
};

interface BulkSuggestionData {
  suggestBulk?: boolean;
  duplicateAssets?: { id: string; tableName: string | null }[];
  title: string;
  itemType: string;
  contentHebrew?: string;
  contentEnglish?: string;
}

interface ContributeFormProps {
  tables?: TableWithCounts[];
  fixedAssetId?: string;
  fixedAssetLabel?: string;
  isCanonical?: boolean;
  onSuccess?: (data?: BulkSuggestionData) => void;
}

// ─── Component ──────────────────────────────────────────────────

function ContributeForm({
  tables,
  fixedAssetId,
  fixedAssetLabel,
  isCanonical,
  onSuccess,
}: ContributeFormProps) {
  const router = useRouter();
  const orgSlug = useOrgSlug();
  const [isPending, startTransition] = useTransition();

  const [selectedTable, setSelectedTable] = useState(fixedAssetId ?? "");
  const [selectedAssetId, setSelectedAssetId] = useState(fixedAssetId ?? "");
  const [itemType, setItemType] = useState("");
  const [title, setTitle] = useState("");
  const [contentHebrew, setContentHebrew] = useState("");
  const [contentEnglish, setContentEnglish] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedTableObj = tables?.find((t) => t.id === selectedTable);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData: ContributeFormData = {
      dataAssetId: selectedAssetId || selectedTable,
      itemType: itemType as ContributeFormData["itemType"],
      title,
      contentHebrew: contentHebrew || undefined,
      contentEnglish: contentEnglish || undefined,
    };

    const result = contributeSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        const response = await submitKnowledgeDraft({
          dataAssetId: result.data.dataAssetId,
          title: result.data.title,
          itemType: result.data.itemType,
          contentHebrew: result.data.contentHebrew,
          contentEnglish: result.data.contentEnglish,
          isCanonical: isCanonical ?? false,
          orgSlug,
        });
        toast.success("פריט הידע נשלח לבדיקה בהצלחה");
        if (onSuccess) {
          onSuccess({
            suggestBulk: response.suggestBulk,
            duplicateAssets: response.duplicateAssets,
            title: result.data.title,
            itemType: result.data.itemType,
            contentHebrew: result.data.contentHebrew,
            contentEnglish: result.data.contentEnglish,
          });
        } else {
          router.push(`/${orgSlug}/assets/${result.data.dataAssetId}`);
        }
      } catch {
        toast.error("שגיאה ביצירת פריט הידע");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" dir="rtl">
      {/* Asset Selection — hidden if pre-bound */}
      {!fixedAssetId && tables && (
        <>
          <FieldGroup label="טבלה" required error={errors.dataAssetId}>
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
                      <LtrText className="body-small-regular">{t.tableName}</LtrText>
                      <span className="body-xsmall-regular text-muted-foreground">
                        {t.hebrewName}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          {/* Column Selection (optional, within table) */}
          {selectedTableObj?.children && selectedTableObj.children.length > 0 && (
            <FieldGroup label="עמודה (אופציונלי)">
              <Select
                value={selectedAssetId === selectedTable ? "" : selectedAssetId}
                onValueChange={(v) => setSelectedAssetId(v || selectedTable)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="כל הטבלה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={selectedTable}>
                    כל הטבלה
                  </SelectItem>
                  {selectedTableObj.children.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2">
                        <LtrText className="body-xsmall-regular font-mono">
                          {col.columnName}
                        </LtrText>
                        {col.hebrewName && (
                          <span className="body-xsmall-regular text-muted-foreground">
                            {col.hebrewName}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
          )}
        </>
      )}

      {fixedAssetId && fixedAssetLabel && (
        <FieldGroup label="נכס מידע">
          <div className="px-3 py-2 bg-muted/50 rounded-lg border text-sm">
            <LtrText>{fixedAssetLabel}</LtrText>
          </div>
        </FieldGroup>
      )}

      {/* Knowledge Type */}
      <FieldGroup label="סוג ידע" required error={errors.itemType}>
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
      </FieldGroup>

      {/* Title */}
      <FieldGroup label="כותרת" required error={errors.title}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="כותרת קצרה ומתארת"
        />
      </FieldGroup>

      {/* Hebrew Content */}
      <FieldGroup
        label="תוכן בעברית"
        error={errors.contentHebrew}
      >
        <Textarea
          value={contentHebrew}
          onChange={(e) => setContentHebrew(e.target.value)}
          placeholder="תיאור מפורט בעברית..."
          rows={4}
          className="leading-relaxed"
        />
      </FieldGroup>

      {/* English Content */}
      <FieldGroup label="Content in English">
        <Textarea
          value={contentEnglish}
          onChange={(e) => setContentEnglish(e.target.value)}
          placeholder="Detailed description in English..."
          rows={4}
          dir="ltr"
          className="text-left font-mono leading-relaxed"
        />
      </FieldGroup>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full gap-2"
        disabled={isPending}
        size="lg"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            שולח...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            שלח לבדיקה
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Reusable field wrapper ─────────────────────────────────────

function FieldGroup({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="body-medium-regular">
        {label}
        {required && <span className="text-destructive mr-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default ContributeForm;
