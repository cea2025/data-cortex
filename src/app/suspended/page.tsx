import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import Link from "next/link";

export default function SuspendedPage() {
  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--surface-page)",
        padding: "var(--space-xl)",
      }}
    >
      <div
        style={{
          maxWidth: "28rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-lg)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: "var(--radius-full)",
            background: "hsl(0 84% 95%)",
            color: "hsl(0 84% 40%)",
          }}
        >
          <Ban size={36} />
        </div>

        <h1 className="heading-h2-bold" style={{ color: "var(--font-primary-default)" }}>
          הגישה למערכת הושעתה
        </h1>

        <p className="body-medium-regular" style={{ color: "var(--font-secondary-default)", lineHeight: 1.7 }}>
          חשבונך הושעה על ידי מנהל המערכת.
          <br />
          אנא פנה למנהל המערכת שלך לקבלת מידע נוסף.
        </p>

        <Link href="/login">
          <Button variant="outline" className="gap-2">
            חזרה למסך הכניסה
          </Button>
        </Link>
      </div>
    </div>
  );
}
