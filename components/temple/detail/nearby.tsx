import { formatDistance } from "@/lib/format";
import type { NearbyAttraction } from "@/lib/types";

export function Nearby({ items }: { items: NearbyAttraction[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((a) => (
        <li key={a.name} className="flex gap-4 rounded-card border border-line bg-canvas-soft p-5">
          <span className="shrink-0 whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-label text-magenta-deep">
            {formatDistance(a.distanceKm)}
          </span>
          <div>
            <p className="font-display text-lg leading-snug text-plum">{a.name}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{a.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
