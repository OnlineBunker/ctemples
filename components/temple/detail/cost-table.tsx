import type { CostEstimate } from "@/lib/types";
import { formatDistance } from "@/lib/format";

/** Curated, static cost bands as a comparison table (desktop) / cards (mobile). */
export function CostTable({ estimates }: { estimates: CostEstimate[] }) {
  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-card border border-brass/15 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-nightstone-800/60">
            <tr className="font-mono text-[0.6rem] uppercase tracking-label text-brass/80">
              <th scope="col" className="px-5 py-4 font-normal">From</th>
              <th scope="col" className="px-5 py-4 font-normal">Budget</th>
              <th scope="col" className="px-5 py-4 font-normal">Mid-range</th>
              <th scope="col" className="px-5 py-4 font-normal">Luxury</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brass/10">
            {estimates.map((e) => (
              <tr key={e.fromCity} className="align-top">
                <th scope="row" className="px-5 py-5 text-left font-normal">
                  <span className="font-display text-lg text-limewash">{e.fromCity}</span>
                  <span className="mt-1 block font-mono text-[0.6rem] uppercase tracking-label text-limewash/45">
                    {formatDistance(e.distanceKm)} · {e.travelTime}
                  </span>
                </th>
                <td className="px-5 py-5 text-limewash/85">{e.budget}</td>
                <td className="px-5 py-5 text-limewash/85">{e.midRange}</td>
                <td className="px-5 py-5 text-limewash/85">{e.luxury}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {estimates.map((e) => (
          <div key={e.fromCity} className="rounded-card border border-brass/15 bg-nightstone-800/40 p-5">
            <p className="font-display text-lg text-limewash">from {e.fromCity}</p>
            <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-label text-limewash/45">
              {formatDistance(e.distanceKm)} · {e.travelTime}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Budget", e.budget],
                ["Mid-range", e.midRange],
                ["Luxury", e.luxury],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-limewash/50">{label}</dt>
                  <dd className="text-right text-limewash/85">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-label text-limewash/40">
        Approximate per-person estimates · travel + stay + food for a short trip
      </p>
    </div>
  );
}
