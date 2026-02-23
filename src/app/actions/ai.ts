"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/rbac";
import { generateAssetSynthesis } from "@/lib/ai/anthropic";

export async function regenerateInsight(assetId: string) {
  const user = await requireAdmin();

  const result = await generateAssetSynthesis(assetId);

  const estimatedTokens = Math.round(
    (result.insight.synthesis.length / 4) * 3
  );

  await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      aiCallsCount: { increment: 1 },
      aiTokensUsed: { increment: estimatedTokens },
    },
  });

  revalidatePath(`/assets/${assetId}`);
  return result;
}
