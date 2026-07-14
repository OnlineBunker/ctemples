import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Field-guide eyebrow: a mono, spaced label with a short lead rule.
 *  magenta by default; `tone="warm"` (saffron) for premium sections. */
export function Eyebrow({
  children,
  className,
  tone = "red",
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  tone?: "red" | "warm";
  as?: "p" | "span" | "h2";
}) {
  return (
    <Tag
      className={cn(
        "eyebrow inline-flex items-center gap-3",
        tone === "warm" && "text-saffron",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("h-px w-7", tone === "warm" ? "bg-saffron/45" : "bg-magenta/40")}
      />
      {children}
    </Tag>
  );
}
