import { User, FileText, Cpu } from "lucide-react";
import type { SourceProvenance } from "@/types/domain";
import styles from "./ProvenanceTag.module.css";

interface ProvenanceTagProps {
  provenance: unknown;
  author: { displayName: string; email: string };
}

function ProvenanceTag({ provenance, author }: ProvenanceTagProps) {
  const prov = provenance as SourceProvenance | null;

  return (
    <div className={styles.container}>
      <span className={styles.item}>
        <User className={styles.icon} />
        <span className={styles.author}>{author.displayName}</span>
      </span>
      {prov?.source && (
        <>
          <span className={styles.separator}>|</span>
          <span className={styles.item}>
            <FileText className={styles.icon} />
            {prov.source}
          </span>
        </>
      )}
      {prov?.generatedBy && (
        <>
          <span className={styles.separator}>|</span>
          <span className={styles.item}>
            <Cpu className={styles.icon} />
            {prov.generatedBy}
            {prov.confidence != null && (
              <span className={styles.confidence}>
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
