"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LtrText } from "@/components/ltr-text";
import {
  Table2,
  Columns3,
  Loader2,
  Link2,
  CheckCircle2,
} from "lucide-react";
import { useOrgSlug } from "@/lib/org-context";
import {
  searchAssetsForRelationship,
  addAssetRelationship,
} from "@/app/actions/relationships";
import { RELATIONSHIP_TYPE_LABELS, ASSET_TYPE_LABELS } from "@/types/domain";
import type { RelationshipType, AssetType } from "@/types/domain";
import styles from "./ConnectAssetDialog.module.css";

interface ConnectAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceAssetId: string;
  sourceAssetLabel: string;
  onSuccess: () => void;
}

interface SearchResultItem {
  id: string;
  assetType: string;
  label: string;
  path: string;
  hebrewName: string | null;
}

function ConnectAssetDialog({
  open,
  onOpenChange,
  sourceAssetId,
  sourceAssetLabel,
  onSuccess,
}: ConnectAssetDialogProps) {
  const orgSlug = useOrgSlug();
  const [step, setStep] = useState<"search" | "details">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<SearchResultItem | null>(null);
  const [relType, setRelType] = useState<RelationshipType>("foreign_key");
  const [description, setDescription] = useState("");
  const [submitting, startSubmit] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const reset = useCallback(() => {
    setStep("search");
    setQuery("");
    setResults([]);
    setSelectedAsset(null);
    setRelType("foreign_key");
    setDescription("");
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const doSearch = useCallback(
    async (term: string) => {
      if (term.length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const data = await searchAssetsForRelationship(term, orgSlug, sourceAssetId);
        setResults(data);
      } finally {
        setSearching(false);
      }
    },
    [orgSlug, sourceAssetId]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const handleSelect = (asset: SearchResultItem) => {
    setSelectedAsset(asset);
    setStep("details");
  };

  const handleSubmit = () => {
    if (!selectedAsset) return;
    startSubmit(async () => {
      await addAssetRelationship({
        sourceId: sourceAssetId,
        targetId: selectedAsset.id,
        type: relType,
        description: description.trim() || undefined,
        orgSlug,
      });
      onSuccess();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${styles.content} sm:max-w-lg`} dir="rtl">
        <DialogHeader className={styles.header}>
          <DialogTitle className={styles.headerTitle}>
            <Link2 className="h-5 w-5 text-teal-500" />
            צור קשר חדש
          </DialogTitle>
          <DialogDescription>
            {step === "search"
              ? "חפש נכס (טבלה או עמודה) לקישור"
              : "הגדר את סוג הקשר"
            }
          </DialogDescription>
        </DialogHeader>

        {step === "search" ? (
          <div className={styles.searchStep}>
            <Command shouldFilter={false} className="border-none">
              <CommandInput
                dir="ltr"
                placeholder="Search tables & columns..."
                value={query}
                onValueChange={handleQueryChange}
              />
              <CommandList className={styles.searchList}>
                {searching && (
                  <div className={styles.searchingState}>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="body-small-regular">מחפש...</span>
                  </div>
                )}
                {!searching && query.length >= 2 && results.length === 0 && (
                  <CommandEmpty>לא נמצאו תוצאות</CommandEmpty>
                )}
                {!searching && results.length > 0 && (
                  <CommandGroup>
                    {results.map((asset) => {
                      const Icon = asset.assetType === "column" ? Columns3 : Table2;
                      return (
                        <CommandItem
                          key={asset.id}
                          value={asset.id}
                          onSelect={() => handleSelect(asset)}
                          className={styles.resultItem}
                        >
                          <div className={styles.resultIcon}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className={styles.resultBody}>
                            <div className={styles.resultHeader}>
                              <LtrText className="body-medium-regular truncate">
                                {asset.label}
                              </LtrText>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {ASSET_TYPE_LABELS[asset.assetType as AssetType]}
                              </Badge>
                            </div>
                            <LtrText className={styles.resultPath}>
                              {asset.path}
                            </LtrText>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        ) : (
          <div className={styles.detailsStep}>
            {/* Source → Target summary */}
            <div className={styles.summaryBox}>
              <div className={styles.summaryCell}>
                <p className={styles.summaryLabel}>מקור</p>
                <LtrText className={styles.summaryValue}>{sourceAssetLabel}</LtrText>
              </div>
              <div className={styles.summaryIcon}>
                <Link2 className="h-5 w-5" />
              </div>
              <div className={styles.summaryCell}>
                <p className={styles.summaryLabel}>יעד</p>
                <LtrText className={styles.summaryValue}>
                  {selectedAsset?.label}
                </LtrText>
                <LtrText className={styles.summaryPath}>
                  {selectedAsset?.path}
                </LtrText>
              </div>
            </div>

            {/* Relationship type */}
            <div className={styles.fieldGroup}>
              <Label className="body-medium-regular">סוג הקשר</Label>
              <Select value={relType} onValueChange={(v) => setRelType(v as RelationshipType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(RELATIONSHIP_TYPE_LABELS) as [RelationshipType, string][]).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className={styles.fieldGroup}>
              <Label className="body-medium-regular">תיאור (אופציונלי)</Label>
              <Textarea
                dir="rtl"
                placeholder="הסבר קצר על הקשר בין הנכסים..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter className={styles.footer}>
          {step === "details" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep("search")}
              className={styles.footerBack}
            >
              חזרה לחיפוש
            </Button>
          )}
          {step === "details" && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || !selectedAsset}
              className="gap-1.5"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              שמור קשר
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectAssetDialog;
