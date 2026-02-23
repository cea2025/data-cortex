"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function markNotificationAsRead(notificationId: string) {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });

  revalidatePath("/notifications");
}

export async function markAllNotificationsAsRead() {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/notifications");
}

export async function getUnreadCount(): Promise<number> {
  const user = await requireUser();

  return prisma.notification.count({
    where: { userId: user.id, read: false },
  });
}
