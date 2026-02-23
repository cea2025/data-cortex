import { prisma } from "@/lib/prisma";
import { getPendingReviews } from "@/app/actions/knowledge";
import { getCurrentUser } from "@/lib/auth";
import NotificationsList from "@/components/notifications-list";
import ReviewDashboard from "@/components/knowledge/review-dashboard";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const user = await getCurrentUser();

  const [pendingItems, notifications] = await Promise.all([
    getPendingReviews(orgSlug),
    user
      ? prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      : [],
  ]);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto flex flex-col gap-5 sm:gap-8" dir="rtl">
      <section>
        <ReviewDashboard items={pendingItems} />
      </section>

      <section>
        <h2 className="heading-h3-bold mb-4">התראות</h2>
        <NotificationsList notifications={notifications} />
      </section>
    </div>
  );
}
