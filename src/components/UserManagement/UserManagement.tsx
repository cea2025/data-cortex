"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  approveUser,
  suspendUser,
  reactivateUser,
  changeUserRole,
} from "@/app/actions/users";
import { USER_STATUS_LABELS, USER_ROLE_LABELS } from "@/types/domain";
import type { UserRole, UserStatus } from "@/types/domain";
import { useOrgSlug } from "@/lib/org-context";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  Clock,
  Ban,
  Shield,
  Loader2,
  Sparkles,
} from "lucide-react";
import styles from "./UserManagement.module.css";

interface UserItem {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  status: string;
  isSuperAdmin: boolean;
  isServiceAccount: boolean;
  aiCallsCount: number;
  aiTokensUsed: number;
  createdAt: Date | string;
}

interface Props {
  initialUsers: UserItem[];
}

const COST_PER_1K_TOKENS = 0.003;

function estimateCost(tokens: number): string {
  const cost = (tokens / 1000) * COST_PER_1K_TOKENS;
  return `$${cost.toFixed(4)}`;
}

function UserManagement({ initialUsers }: Props) {
  const orgSlug = useOrgSlug();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const pending = initialUsers.filter((u) => u.status === "PENDING");
  const active = initialUsers.filter((u) => u.status === "ACTIVE");
  const suspended = initialUsers.filter((u) => u.status === "SUSPENDED");

  const handleApprove = (userId: string) => {
    startTransition(async () => {
      try {
        await approveUser(userId, orgSlug);
        toast.success("משתמש אושר בהצלחה");
        router.refresh();
      } catch {
        toast.error("שגיאה באישור המשתמש");
      }
    });
  };

  const handleSuspend = (userId: string) => {
    startTransition(async () => {
      try {
        await suspendUser(userId, orgSlug);
        toast.success("משתמש הושעה");
        router.refresh();
      } catch {
        toast.error("שגיאה בהשעיית המשתמש");
      }
    });
  };

  const handleReactivate = (userId: string) => {
    startTransition(async () => {
      try {
        await reactivateUser(userId, orgSlug);
        toast.success("משתמש הופעל מחדש");
        router.refresh();
      } catch {
        toast.error("שגיאה בהפעלת המשתמש");
      }
    });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      try {
        await changeUserRole(userId, newRole as Parameters<typeof changeUserRole>[1], orgSlug);
        toast.success("תפקיד עודכן");
        router.refresh();
      } catch {
        toast.error("שגיאה בעדכון התפקיד");
      }
    });
  };

  const renderStatusBadge = (status: string) => {
    const statusClass =
      status === "PENDING"
        ? styles.statusPending
        : status === "ACTIVE"
          ? styles.statusActive
          : styles.statusSuspended;
    return (
      <span className={`${styles.statusBadge} ${statusClass}`}>
        {USER_STATUS_LABELS[status as UserStatus] ?? status}
      </span>
    );
  };

  const renderTable = (
    users: UserItem[],
    tabType: "pending" | "active" | "suspended"
  ) => {
    if (users.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Users size={32} style={{ margin: "0 auto var(--space-md)", opacity: 0.2 }} />
          <p className="body-medium-regular">
            {tabType === "pending"
              ? "אין משתמשים ממתינים לאישור"
              : tabType === "suspended"
                ? "אין משתמשים מושעים"
                : "אין משתמשים פעילים"}
          </p>
        </div>
      );
    }

    return (
      <Card>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className="body-small-semibold">משתמש</th>
              <th className="body-small-semibold">אימייל</th>
              <th className="body-small-semibold">תפקיד</th>
              <th className="body-small-semibold">סטטוס</th>
              <th className="body-small-semibold">שימוש AI</th>
              <th className="body-small-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className={styles.userCell}>
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt=""
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <span className="body-small-semibold">
                          {u.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className={styles.userName}>
                      <span className="body-small-semibold">{u.displayName}</span>
                      {u.isSuperAdmin && (
                        <span className="body-tiny-regular" style={{ color: "var(--font-brand)" }}>
                          Super Admin
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="body-small-regular" dir="ltr">
                    {u.email}
                  </span>
                </td>
                <td>
                  {u.isSuperAdmin ? (
                    <span className="body-small-semibold" style={{ color: "var(--font-brand)" }}>
                      Super Admin
                    </span>
                  ) : (
                    <Select
                      defaultValue={u.role}
                      onValueChange={(val) => handleRoleChange(u.id, val)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(USER_ROLE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </td>
                <td>{renderStatusBadge(u.status)}</td>
                <td>
                  <div className={styles.aiUsage}>
                    <span className="body-small-regular">
                      <Sparkles size={12} style={{ display: "inline", marginInlineEnd: 4 }} />
                      {u.aiCallsCount} קריאות
                    </span>
                    <span className={`${styles.aiCost} body-tiny-regular`}>
                      {u.aiTokensUsed.toLocaleString()} tokens ≈ {estimateCost(u.aiTokensUsed)}
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.actions}>
                    {tabType === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(u.id)}
                        disabled={isPending}
                        className="gap-1"
                      >
                        {isPending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <UserCheck size={12} />
                        )}
                        אשר
                      </Button>
                    )}
                    {tabType === "active" && !u.isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleSuspend(u.id)}
                        disabled={isPending}
                        className="gap-1"
                      >
                        <Ban size={12} />
                        השעה
                      </Button>
                    )}
                    {tabType === "suspended" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReactivate(u.id)}
                        disabled={isPending}
                        className="gap-1"
                      >
                        <UserCheck size={12} />
                        הפעל מחדש
                      </Button>
                    )}
                    {tabType === "pending" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleSuspend(u.id)}
                        disabled={isPending}
                        className="gap-1"
                      >
                        <Ban size={12} />
                        דחה
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  };

  return (
    <div className={styles.container} dir="rtl">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className="heading-h2-bold" style={{ color: "var(--font-primary-default)" }}>
            ניהול משתמשים
          </h1>
          <p className="body-medium-regular" style={{ color: "var(--font-secondary-default)" }}>
            ניהול הרשאות, אישור גישה ומעקב שימוש AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={20} style={{ color: "var(--font-brand)" }} />
          <span className="body-small-semibold" style={{ color: "var(--font-brand)" }}>
            {initialUsers.length} משתמשים
          </span>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock size={14} />
            ממתינים ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-1.5">
            <UserCheck size={14} />
            פעילים ({active.length})
          </TabsTrigger>
          <TabsTrigger value="suspended" className="gap-1.5">
            <Ban size={14} />
            מושעים ({suspended.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {renderTable(pending, "pending")}
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          {renderTable(active, "active")}
        </TabsContent>
        <TabsContent value="suspended" className="mt-4">
          {renderTable(suspended, "suspended")}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UserManagement;
