"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateKnowledgeStatus } from "@/app/actions/knowledge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ReviewActionsProps {
  itemId: string;
}

export function ReviewActions({ itemId }: ReviewActionsProps) {
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
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="default"
        className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
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
        className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
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
