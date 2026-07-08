import { formatDistance } from "@/lib/format";
import type { NearbyAttraction } from "@/lib/types";

export function Nearby({ items }: { items: NearbyAttraction[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((a) => (
        <li key={a.name} className="flex gap-4 rounded-card border border-brass/15 bg-nightstone-800/40 p-5">
          <span className="shrink-0 whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-label text-brass">
            {formatDistance(a.distanceKm)}
          </span>
          <div>
            <p className="font-display text-lg leading-snug text-limewash">{a.name}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-limewash/70">{a.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
