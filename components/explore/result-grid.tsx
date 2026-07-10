import { ResultCard } from "./result-card";
import type { TempleSummary } from "@/lib/temples";

/**
 * No card carries `priority` here — Explore has no single LCP element the way the
 * homepage hero does (docs/01 §5's "single priority image per page" bar), so nothing
 * on this grid claims it. Images lazy-load by default (next/image).
 */
export function ResultGrid({ items }: { items: TempleSummary[] }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((temple) => (
        <ResultCard key={temple.id} temple={temple} />
      ))}
    </div>
  );
}
