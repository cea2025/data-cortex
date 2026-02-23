import { Button } from "@/components/ui/button";
import { Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function PendingPage() {
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
            background: "var(--surface-brand-subtle)",
            color: "var(--font-brand)",
          }}
        >
          <Clock size={36} />
        </div>

        <h1 className="heading-h2-bold" style={{ color: "var(--font-primary-default)" }}>
          החשבון שלך ממתין לאישור
        </h1>

        <p className="body-medium-regular" style={{ color: "var(--font-secondary-default)", lineHeight: 1.7 }}>
          הבקשה שלך התקבלה בהצלחה. מנהל המערכת יבדוק אותה בהקדם.
          <br />
          אנא פנה למנהל המערכת שלך אם יש צורך בזירוז.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            padding: "var(--space-md) var(--space-lg)",
            borderRadius: "var(--radius-medium)",
            background: "var(--surface-secondary-default)",
            border: "1px solid var(--border-default)",
            color: "var(--font-secondary-default)",
          }}
        >
          <ShieldAlert size={16} />
          <span className="body-small-regular">
            גישה למערכת תופעל לאחר אישור מנהל
          </span>
        </div>

        <Link href="/login">
          <Button variant="outline" className="gap-2">
            חזרה למסך הכניסה
          </Button>
        </Link>
      </div>
    </div>
  );
}
