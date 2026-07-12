import { Plane, TrainFront, Car, type LucideIcon } from "lucide-react";
import type { ReachMode } from "@/lib/detail-sections";

const ICONS: Record<ReachMode["key"], LucideIcon> = {
  air: Plane,
  train: TrainFront,
  road: Car,
};

/** Section 7 — How to reach (docs/06 §5 row 7). Only the modes with real text render —
 *  never a card guessing at a missing mode (docs/06 §12: "guessing timings/fees for stubs"). */
export function HowToReach({ modes }: { modes: ReachMode[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {modes.map((mode) => {
        const Icon = ICONS[mode.key];
        return (
          <div key={mode.key} className="rounded-card border border-line bg-canvas-soft p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-magenta-soft text-magenta-deep">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 font-display text-lg text-plum">{mode.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{mode.text}</p>
          </div>
        );
      })}
    </div>
  );
}
