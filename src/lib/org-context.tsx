"use client";

import { createContext, useContext } from "react";

interface OrgContextValue {
  orgSlug: string;
  userRole: string;
  isSuperAdmin: boolean;
}

const OrgSlugContext = createContext<OrgContextValue>({
  orgSlug: "",
  userRole: "viewer",
  isSuperAdmin: false,
});

export function OrgProvider({
  orgSlug,
  userRole,
  isSuperAdmin,
  children,
}: {
  orgSlug: string;
  userRole: string;
  isSuperAdmin: boolean;
  children: React.ReactNode;
}) {
  return (
    <OrgSlugContext.Provider value={{ orgSlug, userRole, isSuperAdmin }}>
      {children}
    </OrgSlugContext.Provider>
  );
}

export function useOrgSlug(): string {
  return useContext(OrgSlugContext).orgSlug;
}

export function useUserRole(): { role: string; isSuperAdmin: boolean; isAdmin: boolean } {
  const ctx = useContext(OrgSlugContext);
  return {
    role: ctx.userRole,
    isSuperAdmin: ctx.isSuperAdmin,
    isAdmin: ctx.userRole === "admin" || ctx.isSuperAdmin,
  };
}
