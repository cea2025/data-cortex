import { getTableAssets } from "@/app/actions/assets";
import { DashboardContent } from "@/components/dashboard-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const tables = await getTableAssets(orgSlug);
  return <DashboardContent tables={tables} />;
}
