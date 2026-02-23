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
import styles from "./Sidebar.module.css";

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

  const asideClass = `${styles.aside} ${sidebarCollapsed ? styles.asideCollapsed : styles.asideExpanded}`;

  return (
    <aside className={asideClass}>
      <div className={styles.brand}>
        <Database className={styles.brandIcon} size={24} />
        {!sidebarCollapsed && (
          <span className={`${styles.brandLabel} body-large-semibold`}>
            Data Cortex
          </span>
        )}
      </div>

      {!sidebarCollapsed && <OrgSwitcher />}

      <nav className={styles.nav}>
        <button
          onClick={openSearch}
          className={`${styles.navButton} body-medium-regular`}
        >
          <Search className={styles.navIcon} />
          {!sidebarCollapsed && (
            <>
              <span className={styles.navLabel}>חיפוש</span>
              <kbd className={`${styles.kbd} body-tiny-regular`}>Ctrl+K</kbd>
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
                  className={`${styles.navButton} ${isActive ? styles.navButtonActive : ""} body-medium-regular`}
                >
                  <item.icon className={styles.navIcon} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
      </nav>

      <div className={styles.footer}>
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
