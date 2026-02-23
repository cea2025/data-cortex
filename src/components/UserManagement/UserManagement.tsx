"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
} from "lucide-react";

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
    const badgeClass =
      status === "PENDING"
        ? "bg-gold-100 text-gold-700 border-gold-300"
        : status === "ACTIVE"
          ? "bg-teal-100 text-teal-700 border-teal-300"
          : "bg-red-100 text-red-700 border-red-300";
    return (
      <Badge variant="outline" className={badgeClass}>
        {USER_STATUS_LABELS[status as UserStatus] ?? status}
      </Badge>
    );
  };

  const renderActions = (u: UserItem, tabType: "pending" | "active" | "suspended") => (
    <div className="flex items-center gap-2">
      {tabType === "pending" && (
        <>
          <Button size="sm" onClick={() => handleApprove(u.id)} disabled={isPending} className="gap-1 h-9">
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
            אשר
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleSuspend(u.id)} disabled={isPending} className="gap-1 h-9">
            <Ban size={12} />
            דחה
          </Button>
        </>
      )}
      {tabType === "active" && !u.isSuperAdmin && (
        <Button size="sm" variant="destructive" onClick={() => handleSuspend(u.id)} disabled={isPending} className="gap-1 h-9">
          <Ban size={12} />
          השעה
        </Button>
      )}
      {tabType === "suspended" && (
        <Button size="sm" variant="outline" onClick={() => handleReactivate(u.id)} disabled={isPending} className="gap-1 h-9">
          <UserCheck size={12} />
          הפעל מחדש
        </Button>
      )}
    </div>
  );

  const renderRoleControl = (u: UserItem) => {
    if (u.isSuperAdmin) {
      return <span className="body-small-semibold text-teal-600">Super Admin</span>;
    }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1" disabled={isPending}>
            {USER_ROLE_LABELS[u.role as UserRole] ?? u.role}
            <ChevronDown size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {Object.entries(USER_ROLE_LABELS).map(([key, label]) => (
            <DropdownMenuItem key={key} onClick={() => handleRoleChange(u.id, key)}>
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderTable = (
    users: UserItem[],
    tabType: "pending" | "active" | "suspended"
  ) => {
    if (users.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Users size={32} className="mx-auto mb-3 opacity-20" />
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
      <>
        {/* Mobile: Card list */}
        <div className="flex flex-col gap-3 md:hidden">
          {users.map((u) => (
            <div key={u.id} className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="" className="h-10 w-10 rounded-full shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="body-medium-semibold">{u.displayName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="body-medium-semibold truncate">{u.displayName}</span>
                    {renderStatusBadge(u.status)}
                  </div>
                  <span className="body-small-regular text-muted-foreground block truncate" dir="ltr">{u.email}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {renderRoleControl(u)}
                  <span className="body-tiny-regular text-muted-foreground inline-flex items-center gap-1">
                    <Sparkles size={10} className="text-gold-500" />
                    {u.aiCallsCount} קריאות
                  </span>
                </div>
                {renderActions(u, tabType)}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table */}
        <div className="rounded-xl border shadow-sm overflow-hidden hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="body-small-semibold">משתמש</TableHead>
                <TableHead className="body-small-semibold">אימייל</TableHead>
                <TableHead className="body-small-semibold">תפקיד</TableHead>
                <TableHead className="body-small-semibold">סטטוס</TableHead>
                <TableHead className="body-small-semibold">שימוש AI</TableHead>
                <TableHead className="body-small-semibold">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="body-small-semibold">{u.displayName.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="body-small-semibold">{u.displayName}</span>
                        {u.isSuperAdmin && <span className="body-tiny-regular text-teal-600">Super Admin</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><span className="body-small-regular" dir="ltr">{u.email}</span></TableCell>
                  <TableCell>{renderRoleControl(u)}</TableCell>
                  <TableCell>{renderStatusBadge(u.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="body-small-regular inline-flex items-center gap-1">
                        <Sparkles size={12} className="text-gold-500" />{u.aiCallsCount} קריאות
                      </span>
                      <span className="body-tiny-regular text-muted-foreground">
                        {u.aiTokensUsed.toLocaleString()} tokens ≈ {estimateCost(u.aiTokensUsed)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{renderActions(u, tabType)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="heading-h3-bold sm:heading-h2-bold text-foreground">
            ניהול משתמשים
          </h1>
          <p className="body-small-regular sm:body-medium-regular text-muted-foreground">
            ניהול הרשאות, אישור גישה ומעקב שימוש AI
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Shield size={18} className="text-teal-600" />
          <span className="body-small-semibold text-teal-600">
            {initialUsers.length}
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
