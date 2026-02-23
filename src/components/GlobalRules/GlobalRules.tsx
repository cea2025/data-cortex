"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollText, Plus, Trash2, Loader2 } from "lucide-react";
import { useOrgSlug } from "@/lib/org-context";
import { addOrganizationRule, deleteOrganizationRule } from "@/app/actions/rules";
import { toast } from "sonner";
import styles from "./GlobalRules.module.css";

interface RuleItem {
  id: string;
  content: string;
  createdAt: Date | string;
  author: { displayName: string; email: string };
}

interface Props {
  initialRules: RuleItem[];
}

function GlobalRulesView({ initialRules }: Props) {
  const orgSlug = useOrgSlug();
  const router = useRouter();
  const [newContent, setNewContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!newContent.trim()) return;
    startTransition(async () => {
      try {
        await addOrganizationRule(orgSlug, newContent.trim());
        setNewContent("");
        router.refresh();
        toast.success("כלל חדש נוסף בהצלחה");
      } catch {
        toast.error("שגיאה בהוספת כלל");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteOrganizationRule(id, orgSlug);
        router.refresh();
        toast.success("הכלל נמחק");
      } catch {
        toast.error("שגיאה במחיקת הכלל");
      }
    });
  };

  return (
    <div className={styles.container} dir="rtl">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={`${styles.title} heading-h2-bold`}>כללים ארגוניים</h1>
          <p className={`${styles.subtitle} body-medium-regular`}>
            הנחיות גלובליות החלות על כל מסדי הנתונים בארגון
          </p>
        </div>
      </div>

      {initialRules.length === 0 ? (
        <div className={styles.emptyState}>
          <ScrollText size={40} className={styles.emptyIcon} />
          <p className="body-medium-regular">אין כללים ארגוניים עדיין</p>
          <p className="body-small-regular" style={{ marginTop: "var(--space-xs)" }}>
            הוסיפו כללים גלובליים שחלים על כל מסדי הנתונים
          </p>
        </div>
      ) : (
        <div className={styles.rulesList}>
          {initialRules.map((rule) => (
            <Card key={rule.id} className={styles.ruleCard}>
              <CardContent className={styles.ruleContent}>
                <div className={styles.markdown}>
                  <Markdown>{rule.content}</Markdown>
                </div>
                <div className={`${styles.ruleMeta} body-small-regular`}>
                  <span>{rule.author.displayName}</span>
                  <div className="flex items-center gap-2">
                    <span>
                      {new Date(rule.createdAt).toLocaleDateString("he-IL")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDelete(rule.id)}
                      disabled={isPending}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className={styles.addForm}>
        <p className="body-medium-semibold">הוסף כלל חדש</p>
        <Textarea
          dir="rtl"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="כתוב כלל ארגוני... ניתן להשתמש ב-Markdown כולל ```sql בלוקים"
          rows={4}
          className="resize-none"
        />
        <Button
          onClick={handleAdd}
          disabled={isPending || !newContent.trim()}
          className="gap-1.5"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          הוסף כלל
        </Button>
      </div>
    </div>
  );
}

export default GlobalRulesView;
