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

  // The prototype's beige quick-facts panel (docs/15 §0a): a single rounded
  // porcelain-deep band, mono keys over medium values.
  return (
    <div className="sticky top-16 z-20 bg-porcelain py-3 print:static print:top-auto">
      <dl
        className="grid rounded-[22px] bg-surface-recess"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 20, padding: "clamp(20px,3vw,30px)" }}
      >
        {cells.map((cell) => (
          <div key={cell.label} className="min-w-0">
            <dt className="font-mono text-[9.5px] uppercase tracking-[.2em] text-ink/50">{cell.label}</dt>
            <dd className="mt-[5px] truncate text-[13.5px] font-medium leading-[1.45] text-ink">{cell.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
