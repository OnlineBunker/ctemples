import type { CostEstimate } from "@/lib/types";
import { formatDistance } from "@/lib/format";

/** Section 12 — Cost to visit (docs/06 §5 row 12). Curated, static bands — never a live
 *  calculator. Explicit From city / Distance / Travel time / Budget / Mid-range / Luxury
 *  columns, comparison table on desktop, stacked cards on mobile. */
export function CostTable({ estimates }: { estimates: CostEstimate[] }) {
  return (
    <div>
      <div className="hidden overflow-x-auto rounded-card border border-line print:block md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas-soft">
            <tr className="font-mono text-[0.6rem] uppercase tracking-label text-ink-muted">
              <th scope="col" className="px-5 py-4 font-normal">From city</th>
              <th scope="col" className="px-5 py-4 font-normal">Distance</th>
              <th scope="col" className="px-5 py-4 font-normal">Travel time</th>
              <th scope="col" className="px-5 py-4 font-normal">Budget</th>
              <th scope="col" className="px-5 py-4 font-normal">Mid-range</th>
              <th scope="col" className="px-5 py-4 font-normal">Luxury</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {estimates.map((e) => (
              <tr key={e.fromCity} className="align-top">
                <th scope="row" className="px-5 py-5 font-display text-base font-normal text-plum">
                  {e.fromCity}
                </th>
                <td className="px-5 py-5 text-ink-muted">{formatDistance(e.distanceKm)}</td>
                <td className="px-5 py-5 text-ink-muted">{e.travelTime}</td>
                <td className="px-5 py-5 text-ink">{e.budget}</td>
                <td className="px-5 py-5 text-ink">{e.midRange}</td>
                <td className="px-5 py-5 text-ink">{e.luxury}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-4 print:hidden md:hidden">
        {estimates.map((e) => (
          <div key={e.fromCity} className="rounded-card border border-line bg-canvas-soft p-5">
            <p className="font-display text-lg text-plum">from {e.fromCity}</p>
            <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-label text-ink-muted">
              {formatDistance(e.distanceKm)} · {e.travelTime}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Budget", e.budget],
                ["Mid-range", e.midRange],
                ["Luxury", e.luxury],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="text-right text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-label text-ink-muted">
        Indicative ranges per person; verify locally.
      </p>
    </div>
  );
}
