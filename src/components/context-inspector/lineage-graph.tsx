"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getAssetRelationships } from "@/app/actions/relationships";
import { useOrgSlug } from "@/lib/org-context";
import { RELATIONSHIP_TYPE_LABELS } from "@/types/domain";
import type { RelationshipType, AssetRelationshipWithDetails } from "@/types/domain";
import { Database, Table2, Columns3, GitBranch, Loader2 } from "lucide-react";

const ASSET_ICONS: Record<string, typeof Database> = {
  system: Database,
  schema: Database,
  table: Table2,
  column: Columns3,
};

function AssetNode({ data }: { data: { label: string; assetType: string; sublabel?: string } }) {
  const Icon = ASSET_ICONS[data.assetType] ?? Database;
  return (
    <div className="px-4 py-3 rounded-xl border-2 border-navy-300 bg-white shadow-lg dark:bg-navy-900 dark:border-navy-600 min-w-[160px]">
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400">
          <Icon size={14} />
        </div>
        <div>
          <div className="font-semibold text-sm" dir="ltr">{data.label}</div>
          {data.sublabel && (
            <div className="text-[10px] text-muted-foreground mt-0.5">{data.sublabel}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function CentralNode({ data }: { data: { label: string; sublabel?: string } }) {
  return (
    <div className="px-5 py-4 rounded-2xl border-2 border-teal-500 bg-gradient-to-br from-teal-50 to-navy-50 shadow-xl dark:from-teal-950/30 dark:to-navy-950 dark:border-teal-600 min-w-[180px]">
      <Handle type="target" position={Position.Left} />
      <div className="font-bold text-base text-navy-800 dark:text-white">{data.label}</div>
      {data.sublabel && (
        <div className="text-xs text-teal-600 dark:text-teal-400">{data.sublabel}</div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { asset: AssetNode, central: CentralNode };

function buildGraph(
  assetId: string,
  assetLabel: string,
  outgoing: AssetRelationshipWithDetails[],
  incoming: AssetRelationshipWithDetails[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const seenIds = new Set<string>();

  const centerX = 400;
  const centerY = 250;
  const hSpacing = 300;
  const vSpacing = 100;

  nodes.push({
    id: assetId,
    type: "central",
    position: { x: centerX, y: centerY },
    data: { label: assetLabel, sublabel: "נכס נוכחי" },
  });
  seenIds.add(assetId);

  incoming.forEach((rel, i) => {
    const sourceId = rel.sourceAsset.id;
    if (!seenIds.has(sourceId)) {
      seenIds.add(sourceId);
      const yOffset = (i - (incoming.length - 1) / 2) * vSpacing;
      nodes.push({
        id: sourceId,
        type: "asset",
        position: { x: centerX - hSpacing, y: centerY + yOffset },
        data: {
          label: rel.sourceAsset.columnName ?? rel.sourceAsset.tableName ?? rel.sourceAsset.systemName,
          assetType: rel.sourceAsset.assetType,
          sublabel: RELATIONSHIP_TYPE_LABELS[rel.relationshipType as RelationshipType] ?? rel.relationshipType,
        },
      });
    }
    edges.push({
      id: `e-${rel.id}`,
      source: sourceId,
      target: assetId,
      label: RELATIONSHIP_TYPE_LABELS[rel.relationshipType as RelationshipType] ?? rel.relationshipType,
      animated: true,
      style: { stroke: "var(--border-brand)", strokeWidth: 2 },
      labelStyle: { fontSize: 10, fill: "var(--font-secondary-default)" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--border-brand)" },
    });
  });

  outgoing.forEach((rel, i) => {
    const targetId = rel.targetAsset.id;
    if (!seenIds.has(targetId)) {
      seenIds.add(targetId);
      const yOffset = (i - (outgoing.length - 1) / 2) * vSpacing;
      nodes.push({
        id: targetId,
        type: "asset",
        position: { x: centerX + hSpacing, y: centerY + yOffset },
        data: {
          label: rel.targetAsset.columnName ?? rel.targetAsset.tableName ?? rel.targetAsset.systemName,
          assetType: rel.targetAsset.assetType,
          sublabel: RELATIONSHIP_TYPE_LABELS[rel.relationshipType as RelationshipType] ?? rel.relationshipType,
        },
      });
    }
    edges.push({
      id: `e-${rel.id}`,
      source: assetId,
      target: targetId,
      label: RELATIONSHIP_TYPE_LABELS[rel.relationshipType as RelationshipType] ?? rel.relationshipType,
      animated: true,
      style: { stroke: "var(--border-teal)", strokeWidth: 2 },
      labelStyle: { fontSize: 10, fill: "var(--font-secondary-default)" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--border-teal)" },
    });
  });

  return { nodes, edges };
}

interface LineageGraphProps {
  assetId: string;
  assetLabel: string;
}

function LineageGraph({ assetId, assetLabel }: LineageGraphProps) {
  const orgSlug = useOrgSlug();
  const [loading, setLoading] = useState(true);
  const [relationships, setRelationships] = useState<{
    outgoing: AssetRelationshipWithDetails[];
    incoming: AssetRelationshipWithDetails[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAssetRelationships(assetId, orgSlug).then((data) => {
      if (!cancelled) {
        setRelationships(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [assetId, orgSlug]);

  const graph = useMemo(() => {
    if (!relationships) return null;
    return buildGraph(assetId, assetLabel, relationships.outgoing, relationships.incoming);
  }, [assetId, assetLabel, relationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graph?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph?.edges ?? []);

  useEffect(() => {
    if (graph) {
      setNodes(graph.nodes);
      setEdges(graph.edges);
    }
  }, [graph, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="body-small-regular" style={{ marginInlineStart: "var(--space-sm)" }}>
          טוען גרף...
        </span>
      </div>
    );
  }

  const totalRelationships = (relationships?.outgoing.length ?? 0) + (relationships?.incoming.length ?? 0);

  if (totalRelationships === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <GitBranch size={40} className="opacity-20" />
        <p className="body-medium-regular">אין קשרים מוגדרים לנכס זה</p>
        <p className="body-small-regular">הוסיפו קשרים בלשונית ״קשרי גומלין״ כדי לראות גרף ויזואלי</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} />
          <Controls position="bottom-left" />
          <MiniMap
            nodeStrokeWidth={2}
            pannable
            zoomable
            style={{ borderRadius: 8, border: "1px solid var(--border-default)" }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default LineageGraph;
