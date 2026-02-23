"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { useOrgSlug } from "@/lib/org-context";
import { getAllOrganizations } from "@/lib/org";

interface OrgOption {
  id: string;
  slug: string;
  name: string;
}

function OrgSwitcher() {
  const router = useRouter();
  const currentSlug = useOrgSlug();
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    getAllOrganizations().then(setOrgs);
  }, []);

  if (orgs.length <= 1) return null;

  return (
    <div className="px-2 py-2">
      <Select
        value={currentSlug}
        onValueChange={(slug) => {
          startTransition(() => {
            router.push(`/${slug}/`);
          });
        }}
      >
        <SelectTrigger className="h-8 gap-2 text-xs">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {orgs.map((org) => (
            <SelectItem key={org.id} value={org.slug}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default OrgSwitcher;
