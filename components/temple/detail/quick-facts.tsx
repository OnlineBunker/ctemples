import type { Temple } from "@/lib/types";

interface Cell {
  label: string;
  value: string;
}

/**
 * Section 2 — Quick-facts bar (docs/06 §5 row 2). Location and Region always render (both
 * derive from required fields); Built/Dynasty/Style/Presiding deity/Open today/Entry render
 * only when present — this is also where timings and entry fee live, never a separate
 * section (docs/06 §12 anti-pattern). Sticky (see the page's wrapping container for the
 * "until section 5 scrolls past" behavior — a plain CSS consequence of `sticky` inside a
 * container that ends there, no JS needed).
 */
export function QuickFacts({ temple }: { temple: Temple }) {
  const cells: Cell[] = [
    { label: "Location", value: `${temple.city}, ${temple.state}` },
    { label: "Region", value: `${temple.region} India` },
  ];
  if (temple.quickFacts.built?.trim()) cells.push({ label: "Built", value: temple.quickFacts.built });
  if (temple.quickFacts.dynasty?.trim()) cells.push({ label: "Dynasty", value: temple.quickFacts.dynasty });
  if (temple.quickFacts.architecturalStyle?.trim())
    cells.push({ label: "Style", value: temple.quickFacts.architecturalStyle });
  if (temple.quickFacts.presidingDeity?.trim())
    cells.push({ label: "Presiding deity", value: temple.quickFacts.presidingDeity });
  if (temple.timings?.opening?.trim() && temple.timings?.closing?.trim())
    cells.push({ label: "Open today", value: `${temple.timings.opening}–${temple.timings.closing}` });
  if (temple.entryFee?.indian?.trim()) cells.push({ label: "Entry", value: temple.entryFee.indian });

  return (
    <div className="sticky top-16 z-20 bg-canvas py-3 print:static print:top-auto">
      <div className="relative">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:overflow-visible md:px-0 md:pb-0">
          <dl className="flex gap-px overflow-hidden rounded-card border border-line bg-line md:grid md:grid-cols-4">
            {cells.map((cell) => (
              <div key={cell.label} className="min-w-[9rem] shrink-0 bg-canvas p-4 md:min-w-0 md:shrink md:p-5">
                <dt className="font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
                  {cell.label}
                </dt>
                <dd className="mt-1.5 truncate font-display text-base leading-snug text-plum">
                  {cell.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-canvas to-transparent md:hidden"
        />
      </div>
    </div>
  );
}
