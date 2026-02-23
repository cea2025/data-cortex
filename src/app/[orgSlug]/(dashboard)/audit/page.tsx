import { getAuditLogs, getAuditLogEntityTypes } from "@/app/actions/audit";
import AuditLogViewer from "@/components/audit/audit-log-viewer";
import styles from "./AuditPage.module.css";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const [{ logs, total }, entityTypes] = await Promise.all([
    getAuditLogs({ limit: 50, orgSlug }),
    getAuditLogEntityTypes(orgSlug),
  ]);

  return (
    <div className={styles.container} dir="rtl">
      <div className={styles.titleSection}>
        <h1 className={styles.title}>היסטוריית שינויים</h1>
        <p className={styles.description}>
          מעקב אחר כל הפעולות שבוצעו במערכת
        </p>
      </div>

      <AuditLogViewer
        initialLogs={logs}
        totalCount={total}
        entityTypes={entityTypes}
      />
    </div>
  );
}
