import { TempleCard, summaryToCard } from "@/components/ui/temple-card";
import type { TempleSummary } from "@/lib/temples";

/**
 * The first card carries `priority` (docs/01 §5's "single priority image per page"
 * bar) — it's the page's de facto LCP element (first content to paint, always visible
 * without scrolling at every breakpoint). Every other card lazy-loads by default.
 */
export function ResultGrid({ items }: { items: TempleSummary[] }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((temple, index) => (
        <TempleCard key={temple.id} temple={summaryToCard(temple)} priority={index === 0} />
      ))}
    </div>
  );
}
