"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size={collapsed ? "icon" : "sm"} className="w-full gap-2" disabled>
        <Sun size={16} className="opacity-50" />
        {!collapsed && <span className="body-small-regular opacity-50">ערכת נושא</span>}
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size={collapsed ? "icon" : "sm"}
      className="w-full gap-2"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {!collapsed && (
        <span className="body-small-regular">{isDark ? "מצב בהיר" : "מצב כהה"}</span>
      )}
    </Button>
  );
}
