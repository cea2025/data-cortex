"use server";

import { revalidatePath } from "next/cache";
import { generateAssetSynthesis } from "@/lib/ai/anthropic";

export async function regenerateInsight(assetId: string) {
  const result = await generateAssetSynthesis(assetId);
  revalidatePath(`/assets/${assetId}`);
  return result;
}
