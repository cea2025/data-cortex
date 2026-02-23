import { getOrgUsers } from "@/app/actions/users";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserManagement from "@/components/UserManagement/UserManagement";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin" && !user.isSuperAdmin) {
    redirect(`/${orgSlug}`);
  }

  const users = await getOrgUsers(orgSlug);

  return <UserManagement initialUsers={users} />;
}
