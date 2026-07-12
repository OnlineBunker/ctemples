import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FactRow {
  label: string;
  value: ReactNode;
  hint?: string;
}

/** A label/value list for structured facts (timings, entry fee, how to reach). */
export function FactRows({ rows, className }: { rows: FactRow[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line", className)}>
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
          <dt className="font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
            {row.label}
          </dt>
          <dd className="text-ink">
            {row.value}
            {row.hint ? <span className="mt-1 block text-sm text-ink-muted">{row.hint}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
