import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/utils";
import { getAuditLogs, getAuditLogEntityTypes } from "@/app/actions/audit";
import AuditLogViewer from "@/components/audit/audit-log-viewer";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect(`/${orgSlug}/`);

  const [{ logs, total }, entityTypes] = await Promise.all([
    getAuditLogs({ limit: 50, orgSlug }),
    getAuditLogEntityTypes(orgSlug),
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="heading-h2-bold text-foreground">היסטוריית שינויים</h1>
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
