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
import styles from "./RelationshipsTab.module.css";

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
    <div className={`${styles.container} flex flex-col h-full`} dir="rtl">
      <div className={styles.headerBar}>
        <ArrowLeftRight className="h-4 w-4 text-teal-500" />
        <h2 className={styles.headerTitle}>קשרי גומלין</h2>
        {totalCount > 0 && (
          <span className={styles.headerCount}>{totalCount} קשרים</span>
        )}
        <Button
          variant="default"
          size="sm"
          className={`${styles.createBtn} gap-1.5 text-xs`}
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          צור קשר חדש
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className={styles.content}>
          {/* Outgoing relationships */}
          <section>
            <div className={styles.sectionHeader}>
              <ArrowLeftFromLine className="h-3.5 w-3.5 text-blue-500" />
              <h3 className={styles.sectionTitle}>קשרים יוצאים</h3>
              <span className={styles.sectionHint}>(נכס זה מצביע אל...)</span>
            </div>
            {outgoing.length === 0 ? (
              <EmptySection label="אין קשרים יוצאים" />
            ) : (
              <div className={styles.sectionList}>
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
            <div className={styles.sectionHeader}>
              <ArrowRightToLine className="h-3.5 w-3.5 text-amber-500" />
              <h3 className={styles.sectionTitle}>קשרים נכנסים</h3>
              <span className={styles.sectionHint}>(נכסים המצביעים לכאן...)</span>
            </div>
            {incoming.length === 0 ? (
              <EmptySection label="אין קשרים נכנסים" />
            ) : (
              <div className={styles.sectionList}>
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
  foreign_key: styles.cardForeignKey,
  business_flow: styles.cardBusinessFlow,
  calculated_from: styles.cardCalculatedFrom,
};

const typeBadgeClasses: Record<string, string> = {
  foreign_key: styles.badgeForeignKey,
  business_flow: styles.badgeBusinessFlow,
  calculated_from: styles.badgeCalculatedFrom,
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
  const cardClass = typeCardClasses[rel.relationshipType] ?? styles.card;
  const badgeClass = typeBadgeClasses[rel.relationshipType];

  return (
    <div className={`${styles.card} ${cardClass}`}>
      <div className={styles.cardInner}>
        <div className={styles.iconContainer}>
          <AssetIcon className="h-4 w-4" />
        </div>
        <div className={styles.cardBody}>
          <div className={styles.cardHeader}>
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
          <LtrText className={styles.cardPath}>
            {linkedPath}
          </LtrText>
          {rel.description && (
            <p className={styles.cardDescription} dir="rtl">
              {rel.description}
            </p>
          )}
          <div className={styles.cardMeta}>
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
    <div className={styles.emptySection}>
      <ArrowLeftRight className={`h-6 w-6 ${styles.emptyIcon}`} />
      <p className={styles.emptyLabel}>{label}</p>
    </div>
  );
}

export default RelationshipsTab;
