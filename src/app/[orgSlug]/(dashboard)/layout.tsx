import { redirect, notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import Omnibar from "@/components/omnibar";
import { OrgProvider } from "@/lib/org-context";
import { getCurrentUser } from "@/lib/auth";
import { getOrganizationBySlug } from "@/lib/org";
import { prisma } from "@/lib/prisma";

const STATIC_PATHS = new Set(["favicon.ico", "favicon.png", "robots.txt", "sitemap.xml"]);

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  if (STATIC_PATHS.has(orgSlug) || orgSlug.includes(".")) {
    notFound();
  }

  const [user, org] = await Promise.all([
    getCurrentUser(),
    getOrganizationBySlug(orgSlug),
  ]);

  if (!user) redirect("/login");
  if (!org) notFound();

  if (!user.isSuperAdmin) {
    if (user.status === "PENDING") redirect("/pending");
    if (user.status === "SUSPENDED") redirect("/suspended");
  }

  if (!user.isSuperAdmin && user.organizationId !== org.id) {
    const userOrg = user.organizationId
      ? await prisma.organization.findUnique({
          where: { id: user.organizationId },
          select: { slug: true },
        })
      : null;
    redirect(userOrg ? `/${userOrg.slug}/` : "/login");
  }

  return (
    <OrgProvider orgSlug={orgSlug} userRole={user.role} isSuperAdmin={user.isSuperAdmin}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-navy-950">{children}</main>
        <Omnibar />
      </div>
    </OrgProvider>
  );
}
