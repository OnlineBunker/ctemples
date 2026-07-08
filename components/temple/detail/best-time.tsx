import { CalendarDays, Sunrise } from "lucide-react";
import type { Temple } from "@/lib/types";

export function BestTime({ best }: { best: Temple["bestTimeToVisit"] }) {
  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-brass/15 bg-nightstone-800/40 p-5">
          <p className="eyebrow inline-flex items-center gap-2 text-limewash/45">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Ideal months
          </p>
          <p className="mt-3 font-display text-xl text-limewash">{best.idealMonths}</p>
        </div>
        <div className="rounded-card border border-brass/15 bg-nightstone-800/40 p-5">
          <p className="eyebrow inline-flex items-center gap-2 text-limewash/45">
            <Sunrise className="h-3.5 w-3.5" aria-hidden /> Ideal time of day
          </p>
          <p className="mt-3 font-display text-xl text-limewash">{best.idealTimeOfDay}</p>
        </div>
      </div>

      <div>
        <p className="eyebrow mb-5 text-limewash/45">Festivals worth planning around</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {best.festivals.map((f) => (
            <li key={f.name} className="rounded-card border border-brass/15 bg-nightstone-800/40 p-5">
              <p className="font-display text-lg leading-snug text-limewash">{f.name}</p>
              <p className="mt-1.5 font-mono text-[0.6rem] uppercase tracking-label text-marigold">
                {f.timing}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-limewash/70">{f.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
