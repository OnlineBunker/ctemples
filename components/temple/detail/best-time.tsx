import { CalendarDays, Sunrise } from "lucide-react";
import type { Temple } from "@/lib/types";

export function BestTime({ best }: { best: Temple["bestTimeToVisit"] }) {
  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-line bg-canvas-soft p-5">
          <p className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Ideal months
          </p>
          <p className="mt-3 font-display text-xl text-plum">{best.idealMonths}</p>
        </div>
        <div className="rounded-card border border-line bg-canvas-soft p-5">
          <p className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
            <Sunrise className="h-3.5 w-3.5" aria-hidden /> Ideal time of day
          </p>
          <p className="mt-3 font-display text-xl text-plum">{best.idealTimeOfDay}</p>
        </div>
      </div>

      {best.festivals.length > 0 ? (
        <div>
          <p className="mb-5 font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
            Festivals worth planning around
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {best.festivals.map((f) => (
              <li key={f.name} className="rounded-card border border-line bg-canvas-soft p-5">
                <p className="font-display text-lg leading-snug text-plum">{f.name}</p>
                <p className="mt-1.5 font-mono text-[0.6rem] uppercase tracking-label text-magenta-deep">
                  {f.timing}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{f.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
