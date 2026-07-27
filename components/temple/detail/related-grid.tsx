import { TempleCard, templeToCard } from "@/components/ui/temple-card";
import { formatRelativeDistance } from "@/lib/format";
import type { Temple } from "@/lib/types";

/**
 * Shared grid for sections 15–17 (docs/06 §7, 1/2/3 cols) on the unified card (docs/15
 * §2F). Distance renders as a small caption beside the card, not inside it — the card's
 * layout has no distance slot.
 */
export function RelatedGrid({ items }: { items: { temple: Temple; distanceKm?: number }[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ temple, distanceKm }) => (
        <div key={temple.id} className="space-y-2">
          <TempleCard temple={templeToCard(temple)} />
          {typeof distanceKm === "number" ? (
            <p className="px-1 font-mono text-label-sm uppercase tracking-label text-ink-muted">
              {formatRelativeDistance(distanceKm)}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
