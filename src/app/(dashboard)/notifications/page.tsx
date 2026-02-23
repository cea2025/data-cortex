import { prisma } from "@/lib/prisma";
import { getPendingReviews } from "@/app/actions/knowledge";
import { NotificationsList } from "@/components/notifications-list";
import { ReviewDashboard } from "@/components/knowledge/review-dashboard";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const [pendingItems, notifications] = await Promise.all([
    getPendingReviews(),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8" dir="rtl">
      {/* Review Dashboard */}
      <section>
        <ReviewDashboard items={pendingItems} />
      </section>

      {/* Notifications */}
      <section>
        <h2 className="text-xl font-bold mb-4">התראות</h2>
        <NotificationsList notifications={notifications} />
      </section>
    </div>
  );
}
