import { User, Database, Cpu } from "lucide-react";
import type { SourceProvenance } from "@/types/domain";

interface ProvenanceTagProps {
  provenance: unknown;
  author: { displayName: string; email: string };
}

export function ProvenanceTag({ provenance, author }: ProvenanceTagProps) {
  const prov = provenance as SourceProvenance | null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
      <span className="flex items-center gap-1">
        <User className="h-3 w-3" />
        {author.displayName}
      </span>
      {prov?.source && (
        <span className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          {prov.source}
        </span>
      )}
      {prov?.generatedBy && (
        <span className="flex items-center gap-1">
          <Cpu className="h-3 w-3" />
          {prov.generatedBy}
          {prov.confidence != null && (
            <span className="text-primary">
              ({Math.round(prov.confidence * 100)}%)
            </span>
          )}
        </span>
      )}
    </div>
  );
}
