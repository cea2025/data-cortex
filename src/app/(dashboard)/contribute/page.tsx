import { getTableAssets } from "@/app/actions/assets";
import { ContributeForm } from "@/components/knowledge/contribute-form";

export const dynamic = "force-dynamic";

export default async function ContributePage() {
  const tables = await getTableAssets();
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">הוספת פריט ידע</h1>
      <p className="text-muted-foreground mb-6">
        שתפו ידע על טבלאות, עמודות ולוגיקה עסקית. הפריט יישלח לבדיקת הבעלים.
      </p>
      <ContributeForm tables={tables} />
    </div>
  );
}
