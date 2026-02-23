import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RootPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  if (user.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { slug: true },
    });
    if (org) redirect(`/${org.slug}/`);
  }

  redirect("/login");
}
