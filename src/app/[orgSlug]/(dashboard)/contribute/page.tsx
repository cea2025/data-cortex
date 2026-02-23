import { getTableAssets } from "@/app/actions/assets";
import ContributeForm from "@/components/knowledge/contribute-form";

export const dynamic = "force-dynamic";

export default async function ContributePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const tables = await getTableAssets(orgSlug);
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="heading-h2-bold text-foreground mb-2">הוספת פריט ידע</h1>
      <p className="text-sm text-muted-foreground mb-6">
        שתפו ידע על טבלאות, עמודות ולוגיקה עסקית. הפריט יישלח לבדיקת הבעלים.
      </p>
      <ContributeForm tables={tables} />
    </div>
  );
}
