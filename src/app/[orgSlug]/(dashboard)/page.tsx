import { getDashboardStats } from "@/app/actions/analytics";
import CoverageDashboard from "@/components/CoverageDashboard/CoverageDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const stats = await getDashboardStats(orgSlug);
  return <CoverageDashboard stats={stats} />;
}
