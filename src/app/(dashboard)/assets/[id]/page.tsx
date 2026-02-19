import { notFound } from "next/navigation";
import { getAssetById } from "@/app/actions/assets";
import { ContextInspector } from "@/components/context-inspector/context-inspector";

export default async function AssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) notFound();

  return <ContextInspector asset={asset} />;
}
