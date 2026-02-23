"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Loader2, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/app/actions/notifications";
import { useOrgSlug } from "@/lib/org-context";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

function NotificationsList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      try {
        await markAllNotificationsAsRead();
        toast.success("כל ההתראות סומנו כנקראו");
      } catch {
        toast.error("שגיאה בעדכון ההתראות");
      }
    });
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>אין התראות חדשות</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {unreadCount} התראות שלא נקראו
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={isPending}
            onClick={handleMarkAllRead}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            סמן הכל כנקרא
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notif) => (
          <NotificationCard key={notif.id} notification={notif} />
        ))}
      </div>
    </div>
  );
}

function NotificationCard({ notification: notif }: { notification: Notification }) {
  const [isPending, startTransition] = useTransition();
  const orgSlug = useOrgSlug();

  const handleClick = () => {
    if (!notif.read) {
      startTransition(async () => {
        await markNotificationAsRead(notif.id);
      });
    }
  };

  const content = (
    <Card
      className={cn(
        "transition-colors",
        !notif.read && "border-r-2 border-r-primary bg-primary/5",
        notif.link && "hover:bg-accent cursor-pointer"
      )}
    >
      <CardContent className="p-4 flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5",
            notif.read ? "text-muted-foreground" : "text-primary"
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : notif.read ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn("text-sm font-semibold", notif.read && "text-muted-foreground")}>
              {notif.title}
            </p>
            <Badge variant="outline" className="text-xs shrink-0">
              {notif.type === "review_request"
                ? "בקשת בדיקה"
                : notif.type === "status_change"
                  ? "עדכון סטטוס"
                  : notif.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {notif.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(notif.createdAt).toLocaleDateString("he-IL", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (notif.link) {
    const prefixedLink = notif.link.startsWith("/")
      ? `/${orgSlug}${notif.link}`
      : notif.link;
    return (
      <Link href={prefixedLink} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return <div onClick={handleClick}>{content}</div>;
}

export default NotificationsList;
