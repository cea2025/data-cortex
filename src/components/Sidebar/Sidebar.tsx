"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Database,
  Search,
  Plus,
  Bell,
  LayoutDashboard,
  History,
  ScrollText,
  Users,
  PanelRightClose,
  PanelRightOpen,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store/ui-store";
import { createBrowserClient } from "@supabase/ssr";
import { useOrgSlug, useUserRole } from "@/lib/org-context";
import OrgSwitcher from "@/components/org-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  path: string;
  icon: typeof LayoutDashboard;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: "", icon: LayoutDashboard, label: "לוח בקרה" },
  { path: "/contribute", icon: Plus, label: "הוסף ידע" },
  { path: "/rules", icon: ScrollText, label: "כללים ארגוניים" },
  { path: "/notifications", icon: Bell, label: "התראות" },
  { path: "/audit", icon: History, label: "היסטוריה", adminOnly: true },
  { path: "/settings/users", icon: Users, label: "ניהול משתמשים", adminOnly: true },
];

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const orgSlug = useOrgSlug();
  const { isAdmin } = useUserRole();
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
      className={`flex flex-col border-e border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-950 transition-all duration-200 ${
        sidebarCollapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-navy-800">
        <Database className="shrink-0 text-teal-600" size={24} />
        {!sidebarCollapsed && (
          <span className="body-large-semibold text-gray-900 dark:text-cream-100">
            Data Cortex
          </span>
        )}
      </div>

      {!sidebarCollapsed && <OrgSwitcher />}

      <nav className="flex-1 p-2 flex flex-col gap-1">
        <button
          onClick={openSearch}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl border-none bg-transparent cursor-pointer transition-colors duration-150 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-900 hover:text-gray-900 dark:hover:text-cream-100 body-medium-regular"
        >
          <Search className="shrink-0 w-5 h-5" />
          {!sidebarCollapsed && (
            <>
              <span className="flex-1 text-start">חיפוש</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-300 dark:border-navy-700 bg-gray-100 dark:bg-navy-900 px-1.5 text-gray-500 dark:text-gray-400 pointer-events-none select-none font-mono body-tiny-regular">
                Ctrl+K
              </kbd>
            </>
          )}
        </button>

        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const href = `/${orgSlug}${item.path}`;
            const isActive =
              item.path === ""
                ? pathname === `/${orgSlug}` || pathname === `/${orgSlug}/`
                : pathname.startsWith(href);

            return (
              <Link key={item.path} href={href}>
                <div
                  className={`flex w-full items-center gap-3 px-3 py-2 rounded-xl border-none bg-transparent cursor-pointer transition-colors duration-150 body-medium-regular ${
                    isActive
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-900 hover:text-gray-900 dark:hover:text-cream-100"
                  }`}
                >
                  <item.icon className="shrink-0 w-5 h-5" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
      </nav>

      <div className="p-2 border-t border-gray-200 dark:border-navy-800 flex flex-col gap-1">
        <ThemeToggle collapsed={sidebarCollapsed} />
        <Button
          variant="ghost"
          size={sidebarCollapsed ? "icon" : "sm"}
          className="w-full gap-2"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          {!sidebarCollapsed && (
            <span className="body-small-regular">יציאה</span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full"
        >
          {sidebarCollapsed ? (
            <PanelRightClose size={16} />
          ) : (
            <PanelRightOpen size={16} />
          )}
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;
