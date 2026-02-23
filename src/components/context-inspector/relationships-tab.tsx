"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LtrText } from "@/components/ltr-text";
import { useOrgSlug } from "@/lib/org-context";
import { getAssetRelationships } from "@/app/actions/relationships";
import { ConnectAssetDialog } from "./connect-asset-dialog";
import {
  ArrowLeftRight,
  ArrowLeftFromLine,
  ArrowRightToLine,
  Plus,
  Loader2,
  Table2,
  Columns3,
  Trash2,
} from "lucide-react";
import {
  RELATIONSHIP_TYPE_LABELS,
  ASSET_TYPE_LABELS,
} from "@/types/domain";
import type {
  AssetRelationshipWithDetails,
  RelationshipType,
  AssetType,
} from "@/types/domain";
import { deleteAssetRelationship } from "@/app/actions/relationships";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RelationshipsTabProps {
  assetId: string;
  assetLabel: string;
}

export function RelationshipsTab({ assetId, assetLabel }: RelationshipsTabProps) {
  const orgSlug = useOrgSlug();
  const router = useRouter();
  const [outgoing, setOutgoing] = useState<AssetRelationshipWithDetails[]>([]);
  const [incoming, setIncoming] = useState<AssetRelationshipWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, startDelete] = useTransition();

  const fetchRelationships = async () => {
    setLoading(true);
    try {
      const data = await getAssetRelationships(assetId, orgSlug);
      setOutgoing(data.outgoing);
      setIncoming(data.incoming);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, orgSlug]);

  const handleDelete = (id: string) => {
    startDelete(async () => {
      await deleteAssetRelationship(id, orgSlug);
      await fetchRelationships();
    });
  };

  const navigateToAsset = (id: string) => {
    router.push(`/${orgSlug}/assets/${id}`);
  };

  const totalCount = outgoing.length + incoming.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin ml-2" />
        <span className="text-sm">טוען קשרים...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-teal-500" />
          <h2 className="text-sm font-semibold">קשרי גומלין</h2>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground">{totalCount} קשרים</span>
          )}
          <Button
            variant="default"
            size="sm"
            className="mr-auto gap-1.5 text-xs"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            צור קשר חדש
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Outgoing relationships */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ArrowLeftFromLine className="h-3.5 w-3.5 text-blue-500" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                קשרים יוצאים
              </h3>
              <span className="text-[10px] text-muted-foreground">
                (נכס זה מצביע אל...)
              </span>
            </div>
            {outgoing.length === 0 ? (
              <EmptySection label="אין קשרים יוצאים" />
            ) : (
              <div className="space-y-2">
                {outgoing.map((rel) => (
                  <RelationshipCard
                    key={rel.id}
                    rel={rel}
                    direction="outgoing"
                    onNavigate={navigateToAsset}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Incoming relationships */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ArrowRightToLine className="h-3.5 w-3.5 text-amber-500" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                קשרים נכנסים
              </h3>
              <span className="text-[10px] text-muted-foreground">
                (נכסים המצביעים לכאן...)
              </span>
            </div>
            {incoming.length === 0 ? (
              <EmptySection label="אין קשרים נכנסים" />
            ) : (
              <div className="space-y-2">
                {incoming.map((rel) => (
                  <RelationshipCard
                    key={rel.id}
                    rel={rel}
                    direction="incoming"
                    onNavigate={navigateToAsset}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </ScrollArea>

      <ConnectAssetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sourceAssetId={assetId}
        sourceAssetLabel={assetLabel}
        onSuccess={() => {
          setDialogOpen(false);
          fetchRelationships();
        }}
      />
    </div>
  );
}

const typeColors: Record<string, string> = {
  foreign_key: "border-blue-500/30 bg-blue-500/5",
  business_flow: "border-amber-500/30 bg-amber-500/5",
  calculated_from: "border-emerald-500/30 bg-emerald-500/5",
};

const typeBadgeColors: Record<string, string> = {
  foreign_key: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  business_flow: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  calculated_from: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function RelationshipCard({
  rel,
  direction,
  onNavigate,
  onDelete,
  deleting,
}: {
  rel: AssetRelationshipWithDetails;
  direction: "outgoing" | "incoming";
  onNavigate: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const linkedAsset = direction === "outgoing" ? rel.targetAsset : rel.sourceAsset;
  const linkedName = linkedAsset.columnName ?? linkedAsset.tableName ?? linkedAsset.systemName;
  const linkedPath = [linkedAsset.systemName, linkedAsset.tableName, linkedAsset.columnName]
    .filter(Boolean)
    .join(" / ");
  const AssetIcon = linkedAsset.assetType === "column" ? Columns3 : Table2;

  return (
    <div
      className={`rounded-lg border p-3 transition-all hover:shadow-sm ${typeColors[rel.relationshipType] ?? "border-border"}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-muted/50 text-muted-foreground shrink-0 mt-0.5">
          <AssetIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigate(linkedAsset.id)}
              className="hover:underline focus:outline-none"
            >
              <LtrText className="text-sm font-semibold text-foreground">
                {linkedName}
              </LtrText>
            </button>
            <Badge
              variant="outline"
              className={`text-[10px] ${typeBadgeColors[rel.relationshipType] ?? ""}`}
            >
              {RELATIONSHIP_TYPE_LABELS[rel.relationshipType as RelationshipType] ?? rel.relationshipType}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {ASSET_TYPE_LABELS[linkedAsset.assetType as AssetType]}
            </Badge>
          </div>
          <LtrText className="text-xs text-muted-foreground block mt-0.5">
            {linkedPath}
          </LtrText>
          {rel.description && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed" dir="rtl">
              {rel.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span>
              נוצר ע&quot;י {rel.author.displayName}
            </span>
            <span>
              {new Date(rel.createdAt).toLocaleDateString("he-IL")}
            </span>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(rel.id)}
                disabled={deleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>מחק קשר</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function EmptySection({ label }: { label: string }) {
  return (
    <div className="text-center py-6 text-muted-foreground rounded-lg border border-dashed">
      <ArrowLeftRight className="h-6 w-6 mx-auto mb-1.5 opacity-20" />
      <p className="text-xs">{label}</p>
    </div>
  );
}
