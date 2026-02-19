import { cn } from "@/lib/utils";

interface LtrTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "div" | "p" | "code" | "pre";
}

export function LtrText({
  children,
  className,
  as: Component = "span",
}: LtrTextProps) {
  return (
    <Component dir="ltr" className={cn("font-mono text-left", className)}>
      {children}
    </Component>
  );
}
