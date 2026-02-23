"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Database,
  LayoutDashboard,
  Plus,
  Bell,
  Menu,
  X,
  ScrollText,
  History,
  Users,
  LogOut,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store/ui-store";
import { createBrowserClient } from "@supabase/ssr";
import { useOrgSlug, useUserRole } from "@/lib/org-context";

const primaryNav = [
  { path: "", icon: LayoutDashboard, label: "בקרה" },
  { path: "/contribute", icon: Plus, label: "הוסף" },
  { path: "/notifications", icon: Bell, label: "התראות" },
];

const secondaryNav = [
  { path: "/rules", icon: ScrollText, label: "כללים ארגוניים", adminOnly: false },
  { path: "/audit", icon: History, label: "היסטוריה", adminOnly: true },
  { path: "/settings/users", icon: Users, label: "ניהול משתמשים", adminOnly: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const orgSlug = useOrgSlug();
  const { isAdmin } = useUserRole();
  const { openSearch } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (itemPath: string) =>
    itemPath === ""
      ? pathname === `/${orgSlug}` || pathname === `/${orgSlug}/`
      : pathname.startsWith(`/${orgSlug}${itemPath}`);

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-navy-800 bg-white/95 dark:bg-navy-950/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Database className="text-teal-600 shrink-0" size={20} />
          <span className="body-medium-semibold text-gray-900 dark:text-cream-100">
            Data Cortex
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={openSearch}
          >
            <Search size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </header>

      {/* Slide-down Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-white dark:bg-navy-950 overflow-auto animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col p-4 gap-1">
            {secondaryNav
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => {
                const href = `/${orgSlug}${item.path}`;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} href={href} onClick={() => setMenuOpen(false)}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                        active
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400"
                          : "text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-navy-900"
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="body-medium-regular">{item.label}</span>
                    </div>
                  </Link>
                );
              })}

            <div className="border-t border-gray-200 dark:border-navy-800 my-2" />

            <button
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-navy-900 transition-colors w-full"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              <span className="body-medium-regular">
                {theme === "dark" ? "מצב בהיר" : "מצב כהה"}
              </span>
            </button>

            <button
              onClick={() => {
                handleSignOut();
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-950/20 transition-colors w-full"
            >
              <LogOut size={20} />
              <span className="body-medium-regular">יציאה</span>
            </button>
          </nav>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 dark:border-navy-800 bg-white/95 dark:bg-navy-950/95 backdrop-blur-sm safe-area-bottom">
        <div className="flex items-stretch justify-around h-16">
          {primaryNav.map((item) => {
            const href = `/${orgSlug}${item.path}`;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={href}
                className={`flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors min-w-[64px] ${
                  active
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-gray-500 dark:text-gray-400 active:text-gray-900 dark:active:text-cream-100"
                }`}
              >
                <item.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                <span className="body-tiny-bold">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors min-w-[64px] ${
              menuOpen
                ? "text-teal-600 dark:text-teal-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Menu size={22} strokeWidth={menuOpen ? 2.5 : 1.5} />
            <span className="body-tiny-bold">עוד</span>
          </button>
        </div>
      </nav>
    </>
  );
}
