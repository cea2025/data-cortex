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
import styles from "./LineageGraph.module.css";

const ASSET_ICONS: Record<string, typeof Database> = {
  system: Database,
  schema: Database,
  table: Table2,
  column: Columns3,
};

function AssetNode({ data }: { data: { label: string; assetType: string; sublabel?: string } }) {
  const Icon = ASSET_ICONS[data.assetType] ?? Database;
  return (
    <div className={styles.node}>
      <Handle type="target" position={Position.Left} />
      <div className={styles.nodeIcon}>
        <Icon size={14} />
      </div>
      <div className={`${styles.nodeLabel} body-small-semibold`}>{data.label}</div>
      {data.sublabel && (
        <div className={`${styles.nodeType} body-tiny-regular`}>{data.sublabel}</div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function CentralNode({ data }: { data: { label: string; sublabel?: string } }) {
  return (
    <div className={styles.centralNode}>
      <Handle type="target" position={Position.Left} />
      <div className={`${styles.centralLabel} body-medium-semibold`}>{data.label}</div>
      {data.sublabel && (
        <div className={`${styles.centralSubLabel} body-tiny-regular`}>{data.sublabel}</div>
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
      <div className={styles.loading}>
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
      <div className={styles.emptyState}>
        <GitBranch size={40} className={styles.emptyIcon} />
        <p className="body-medium-regular">אין קשרים מוגדרים לנכס זה</p>
        <p className="body-small-regular">הוסיפו קשרים בלשונית ״קשרי גומלין״ כדי לראות גרף ויזואלי</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.graphWrapper}>
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
