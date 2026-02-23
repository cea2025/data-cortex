"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateKnowledgeStatus } from "@/app/actions/knowledge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import styles from "./ReviewActions.module.css";

interface ReviewActionsProps {
  itemId: string;
}

function ReviewActions({ itemId }: ReviewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAction = (action: "approved" | "rejected") => {
    startTransition(async () => {
      try {
        await updateKnowledgeStatus(itemId, action);
        toast.success(
          action === "approved" ? "פריט הידע אושר" : "פריט הידע נדחה"
        );
        router.refresh();
      } catch {
        toast.error("שגיאה בעדכון הסטטוס");
      }
    });
  };

  return (
    <div className={styles.container}>
      <Button
        size="sm"
        variant="default"
        className={styles.approveBtn}
        disabled={isPending}
        onClick={() => handleAction("approved")}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        מאשר
      </Button>
      <Button
        size="sm"
        variant="outline"
        className={styles.rejectBtn}
        disabled={isPending}
        onClick={() => handleAction("rejected")}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}
        דוחה
      </Button>
    </div>
  );
}

export default ReviewActions;
