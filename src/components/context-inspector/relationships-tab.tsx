"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LtrText } from "@/components/ltr-text";
import { useOrgSlug } from "@/lib/org-context";
import { getAssetRelationships } from "@/app/actions/relationships";
import ConnectAssetDialog from "./connect-asset-dialog";
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

function RelationshipsTab({ assetId, assetLabel }: RelationshipsTabProps) {
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
        <span className="body-small-regular">טוען קשרים...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <ArrowLeftRight className="h-4 w-4 text-teal-500" />
        <h2 className="text-sm font-bold">קשרי גומלין</h2>
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

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Outgoing relationships */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ArrowLeftFromLine className="h-3.5 w-3.5 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider">קשרים יוצאים</h3>
              <span className="text-xs text-muted-foreground">(נכס זה מצביע אל...)</span>
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
              <h3 className="text-xs font-bold uppercase tracking-wider">קשרים נכנסים</h3>
              <span className="text-xs text-muted-foreground">(נכסים המצביעים לכאן...)</span>
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

const typeCardClasses: Record<string, string> = {
  foreign_key: "border-l-2 border-l-navy-400",
  business_flow: "border-l-2 border-l-teal-400",
  calculated_from: "border-l-2 border-l-gold-400",
};

const typeBadgeClasses: Record<string, string> = {
  foreign_key: "border-navy-300 text-navy-600",
  business_flow: "border-teal-300 text-teal-600",
  calculated_from: "border-gold-300 text-gold-600",
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
  const cardClass = typeCardClasses[rel.relationshipType] ?? "";
  const badgeClass = typeBadgeClasses[rel.relationshipType];

  return (
    <div className={`rounded-xl border p-3 hover:shadow-md transition-shadow ${cardClass}`}>
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted shrink-0">
          <AssetIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigate(linkedAsset.id)}
              className="hover:underline focus:outline-none"
            >
              <LtrText className="body-medium-semibold text-foreground">
                {linkedName}
              </LtrText>
            </button>
            <Badge
              variant="outline"
              className={`text-[10px] ${badgeClass ?? ""}`}
            >
              {RELATIONSHIP_TYPE_LABELS[rel.relationshipType as RelationshipType] ?? rel.relationshipType}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {ASSET_TYPE_LABELS[linkedAsset.assetType as AssetType]}
            </Badge>
          </div>
          <LtrText className="text-xs text-muted-foreground mt-0.5">
            {linkedPath}
          </LtrText>
          {rel.description && (
            <p className="text-sm text-muted-foreground mt-1" dir="rtl">
              {rel.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>נוצר ע&quot;י {rel.author.displayName}</span>
            <span>{new Date(rel.createdAt).toLocaleDateString("he-IL")}</span>
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
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
      <ArrowLeftRight className="h-6 w-6 opacity-20" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export default RelationshipsTab;
