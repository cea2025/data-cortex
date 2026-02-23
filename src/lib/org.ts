"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const resolveOrgId = cache(async (orgSlug: string): Promise<string> => {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) throw new Error(`Organization not found: ${orgSlug}`);
  return org.id;
});

export const getOrganizationBySlug = cache(async (orgSlug: string) => {
  return prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
});

export async function getAllOrganizations() {
  return prisma.organization.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });
}
