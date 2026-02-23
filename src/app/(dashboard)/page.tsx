import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RootPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  if (!user.isSuperAdmin) {
    if (user.status === "PENDING") redirect("/pending");
    if (user.status === "SUSPENDED") redirect("/suspended");
  }

  if (user.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { slug: true },
    });
    if (org) redirect(`/${org.slug}/`);
  }

  if (user.isSuperAdmin) {
    const firstOrg = await prisma.organization.findFirst({
      select: { slug: true },
      orderBy: { createdAt: "asc" },
    });
    if (firstOrg) redirect(`/${firstOrg.slug}/`);
  }

  redirect("/login");
}
