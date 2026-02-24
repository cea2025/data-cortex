import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isRedirectError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { digest?: string }).digest === "NEXT_REDIRECT";
}

export default async function RootPage() {
  try {
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
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("[RootPage]", err);
    redirect("/login");
  }
}
