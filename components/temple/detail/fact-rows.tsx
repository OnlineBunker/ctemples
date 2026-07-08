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
    <dl className={cn("divide-y divide-brass/10", className)}>
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
          <dt className="font-mono text-[0.66rem] uppercase tracking-label text-brass/80">
            {row.label}
          </dt>
          <dd className="text-limewash/85">
            {row.value}
            {row.hint ? <span className="mt-1 block text-sm text-limewash/50">{row.hint}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
