import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Stat({
  value,
  label,
  className,
}: {
  value: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="font-display text-4xl leading-none text-ink md:text-5xl">{value}</span>
      <span className="eyebrow text-ink-muted">{label}</span>
    </div>
  );
}
