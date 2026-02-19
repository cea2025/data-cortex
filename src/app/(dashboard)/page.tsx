import { getTableAssets } from "@/app/actions/assets";
import { DashboardContent } from "@/components/dashboard-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const tables = await getTableAssets();
  return <DashboardContent tables={tables} />;
}
