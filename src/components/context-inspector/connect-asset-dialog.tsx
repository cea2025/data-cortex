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
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
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
          <div className="py-2">
            <Command shouldFilter={false} className="border-none">
              <CommandInput
                dir="ltr"
                placeholder="Search tables & columns..."
                value={query}
                onValueChange={handleQueryChange}
              />
              <CommandList className="max-h-64">
                {searching && (
                  <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
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
                          className="flex items-center gap-3 py-2"
                        >
                          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted shrink-0">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <LtrText className="body-medium-regular truncate">
                                {asset.label}
                              </LtrText>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {ASSET_TYPE_LABELS[asset.assetType as AssetType]}
                              </Badge>
                            </div>
                            <LtrText className="text-xs text-muted-foreground truncate mt-0.5">
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
          <div className="space-y-4">
            {/* Source → Target summary */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">מקור</p>
                <LtrText className="text-sm font-semibold truncate">{sourceAssetLabel}</LtrText>
              </div>
              <div className="shrink-0 text-teal-500">
                <Link2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">יעד</p>
                <LtrText className="text-sm font-semibold truncate">
                  {selectedAsset?.label}
                </LtrText>
                <LtrText className="text-xs text-muted-foreground truncate">
                  {selectedAsset?.path}
                </LtrText>
              </div>
            </div>

            {/* Relationship type */}
            <div className="space-y-2">
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
            <div className="space-y-2">
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

        <DialogFooter>
          {step === "details" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep("search")}
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
