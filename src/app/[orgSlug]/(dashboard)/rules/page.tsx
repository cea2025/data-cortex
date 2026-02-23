import { getOrganizationRules } from "@/app/actions/rules";
import GlobalRulesView from "@/components/GlobalRules/GlobalRules";

export const dynamic = "force-dynamic";

export default async function RulesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const rules = await getOrganizationRules(orgSlug);
  return <GlobalRulesView initialRules={rules} />;
}
