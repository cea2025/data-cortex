"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  Search,
  Plus,
  Bell,
  LayoutDashboard,
  History,
  PanelRightClose,
  PanelRightOpen,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store/ui-store";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useOrgSlug } from "@/lib/org-context";
import { OrgSwitcher } from "@/components/org-switcher";

const navItems = [
  { path: "", icon: LayoutDashboard, label: "לוח בקרה" },
  { path: "/contribute", icon: Plus, label: "הוסף ידע" },
  { path: "/notifications", icon: Bell, label: "התראות" },
  { path: "/audit", icon: History, label: "היסטוריה" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const orgSlug = useOrgSlug();
  const { sidebarCollapsed, toggleSidebar, openSearch } = useUIStore();

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-l border-border bg-card transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Database className="h-6 w-6 text-primary shrink-0" />
        {!sidebarCollapsed && (
          <span className="font-bold text-lg">Data Cortex</span>
        )}
      </div>

      {!sidebarCollapsed && <OrgSwitcher />}

      <nav className="flex-1 p-2 space-y-1">
        <button
          onClick={openSearch}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Search className="h-5 w-5 shrink-0" />
          {!sidebarCollapsed && (
            <>
              <span className="flex-1 text-start">חיפוש</span>
              <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
                Ctrl+K
              </kbd>
            </>
          )}
        </button>

        {navItems.map((item) => {
          const href = `/${orgSlug}${item.path}`;
          const isActive =
            item.path === ""
              ? pathname === `/${orgSlug}` || pathname === `/${orgSlug}/`
              : pathname.startsWith(href);
          return (
            <Link key={item.path} href={href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border space-y-1">
        <Button
          variant="ghost"
          size={sidebarCollapsed ? "icon" : "sm"}
          className={cn("w-full gap-2", !sidebarCollapsed && "justify-start px-3")}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span className="text-xs">יציאה</span>}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full"
        >
          {sidebarCollapsed ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
