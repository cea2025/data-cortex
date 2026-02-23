import { User, FileText, Cpu } from "lucide-react";
import type { SourceProvenance } from "@/types/domain";

interface ProvenanceTagProps {
  provenance: unknown;
  author: { displayName: string; email: string };
}

function ProvenanceTag({ provenance, author }: ProvenanceTagProps) {
  const prov = provenance as SourceProvenance | null;

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
      <span className="inline-flex items-center gap-1">
        <User className="w-3 h-3 shrink-0" />
        <span className="font-medium text-foreground/70">{author.displayName}</span>
      </span>
      {prov?.source && (
        <>
          <span className="text-border">|</span>
          <span className="inline-flex items-center gap-1">
            <FileText className="w-3 h-3 shrink-0" />
            {prov.source}
          </span>
        </>
      )}
      {prov?.generatedBy && (
        <>
          <span className="text-border">|</span>
          <span className="inline-flex items-center gap-1">
            <Cpu className="w-3 h-3 shrink-0" />
            {prov.generatedBy}
            {prov.confidence != null && (
              <span className="font-mono text-teal-600">
                ({Math.round(prov.confidence * 100)}%)
              </span>
            )}
          </span>
        </>
      )}
    </div>
  );
}

export default ProvenanceTag;
