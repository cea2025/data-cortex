import { getTableAssets } from "@/app/actions/assets";
import ContributeForm from "@/components/knowledge/contribute-form";
import styles from "./ContributePage.module.css";

export const dynamic = "force-dynamic";

export default async function ContributePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const tables = await getTableAssets(orgSlug);
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>הוספת פריט ידע</h1>
      <p className={styles.description}>
        שתפו ידע על טבלאות, עמודות ולוגיקה עסקית. הפריט יישלח לבדיקת הבעלים.
      </p>
      <ContributeForm tables={tables} />
    </div>
  );
}
