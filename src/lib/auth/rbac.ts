"use server";

import { requireUser } from "@/lib/auth";
import type { UserRole } from "@/generated/prisma/client";

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin" && !user.isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  if (!user.isSuperAdmin && !roles.includes(user.role)) {
    throw new Error(`Forbidden: Requires one of [${roles.join(", ")}]`);
  }
  return user;
}
