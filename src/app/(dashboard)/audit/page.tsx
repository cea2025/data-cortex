import { getAuditLogs, getAuditLogEntityTypes } from "@/app/actions/audit";
import { AuditLogViewer } from "@/components/audit/audit-log-viewer";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const [{ logs, total }, entityTypes] = await Promise.all([
    getAuditLogs({ limit: 50 }),
    getAuditLogEntityTypes(),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">היסטוריית שינויים</h1>
        <p className="text-sm text-muted-foreground mt-1">
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
