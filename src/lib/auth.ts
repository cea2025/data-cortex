"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/generated/prisma/client";

/**
 * Returns the current authenticated user's profile from Prisma,
 * creating or updating it from the Supabase auth session if needed.
 * Returns null when there is no active session.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.userProfile.upsert({
    where: { id: user.id },
    update: {
      email: user.email ?? "",
      displayName:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email ??
        "Unknown",
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
    create: {
      id: user.id,
      email: user.email ?? "",
      displayName:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email ??
        "Unknown",
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      role: "contributor",
    },
  });

  return profile;
}

/**
 * Like getCurrentUser but throws if no user is found.
 * Use in server actions that require authentication.
 */
export async function requireUser(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required");
  return user;
}
