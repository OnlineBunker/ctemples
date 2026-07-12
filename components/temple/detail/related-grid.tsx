import { TempleCard } from "@/components/temple/temple-card";
import { formatRelativeDistance } from "@/lib/format";
import type { Temple } from "@/lib/types";

/**
 * Shared grid for sections 15–17 (docs/06 §7: "15–17 use TempleCard", 1/2/3 cols). Distance
 * renders as a small caption beside the card, not inside it — TempleCard's own layout
 * (docs/03 §6.2) has no distance slot, and the spec's instruction is to reuse it as-is.
 */
export function RelatedGrid({ items }: { items: { temple: Temple; distanceKm?: number }[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ temple, distanceKm }) => (
        <div key={temple.id} className="space-y-2">
          <TempleCard temple={temple} />
          {typeof distanceKm === "number" ? (
            <p className="px-1 font-mono text-[0.65rem] uppercase tracking-label text-ink-muted">
              {formatRelativeDistance(distanceKm)}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
