"use client";

import { createContext, useContext } from "react";

const OrgSlugContext = createContext<string>("");

export function OrgProvider({
  orgSlug,
  children,
}: {
  orgSlug: string;
  children: React.ReactNode;
}) {
  return (
    <OrgSlugContext.Provider value={orgSlug}>
      {children}
    </OrgSlugContext.Provider>
  );
}

export function useOrgSlug(): string {
  return useContext(OrgSlugContext);
}
