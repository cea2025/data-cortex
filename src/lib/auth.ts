"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/generated/prisma/client";

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const email = user.email ?? "";
  const domain = email.split("@")[1] ?? "";

  let organizationId: string | undefined;
  const existing = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { organizationId: true },
  });

  if (!existing?.organizationId && domain) {
    const org = await prisma.organization.findFirst({
      where: { domainMappings: { has: domain } },
      select: { id: true },
    });
    if (org) organizationId = org.id;
  }

  const profile = await prisma.userProfile.upsert({
    where: { id: user.id },
    update: {
      email,
      displayName:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        email ??
        "Unknown",
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      ...(organizationId ? { organizationId } : {}),
    },
    create: {
      id: user.id,
      email,
      displayName:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        email ??
        "Unknown",
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      role: "viewer",
      status: "PENDING",
      organizationId: organizationId ?? null,
    },
  });

  return profile;
}

export async function requireUser(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required");
  return user;
}
