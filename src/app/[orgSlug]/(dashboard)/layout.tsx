import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import Omnibar from "@/components/omnibar";
import { OrgProvider } from "@/lib/org-context";
import { getCurrentUser } from "@/lib/auth";
import { getOrganizationBySlug } from "@/lib/org";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const [user, org] = await Promise.all([
    getCurrentUser(),
    getOrganizationBySlug(orgSlug),
  ]);

  if (!user) redirect("/login");
  if (!org) redirect("/");

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
        <main className="flex-1 overflow-auto">{children}</main>
        <Omnibar />
      </div>
    </OrgProvider>
  );
}
