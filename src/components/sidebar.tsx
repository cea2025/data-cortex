"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  Search,
  Plus,
  Bell,
  LayoutDashboard,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store/ui-store";

const navLinks = [
  { href: "/", icon: LayoutDashboard, label: "לוח בקרה" },
  { href: "/contribute", icon: Plus, label: "הוסף ידע" },
  { href: "/notifications", icon: Bell, label: "התראות" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, openSearch } = useUIStore();

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

      <nav className="flex-1 p-2 space-y-1">
        {/* Search button – opens Omnibar */}
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

        {/* Navigation links */}
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
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

      <div className="p-2 border-t border-border">
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
