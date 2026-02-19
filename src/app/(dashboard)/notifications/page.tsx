import { prisma } from "@/lib/prisma";
import { NotificationsList } from "@/components/notifications-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">התראות</h1>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
