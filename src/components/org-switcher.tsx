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
import styles from "./OrgSwitcher.module.css";

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
    <div className={styles.wrapper}>
      <Select
        value={currentSlug}
        onValueChange={(slug) => {
          startTransition(() => {
            router.push(`/${slug}/`);
          });
        }}
      >
        <SelectTrigger className={styles.trigger}>
          <Building2 className={styles.triggerIcon} />
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
