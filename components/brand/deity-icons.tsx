import type { ReactElement } from "react";
import type { DeityIcon as DeityIconKey } from "@/lib/deities";
import { cn } from "@/lib/utils";

/**
 * Six hand-built line icons for the deity tiles (and, later, the Explore deity
 * filter). Each is a symbol associated with the deity — icon leads identity, colour
 * only reinforces (DESIGN_SYSTEM §1.5). Stroke inherits `currentColor`.
 *
 * Every shape carries `pathLength={100}` — an SVG presentation attribute that
 * renormalizes that element's OWN dash-length units to 100, regardless of its real
 * geometric length. This is what lets the stroke-draw interaction (below) use one fixed
 * `stroke-dasharray`/`stroke-dashoffset` pair for every icon, uniformly, without having to
 * measure each shape's actual path length at runtime.
 */

const paths: Record<DeityIconKey, ReactElement> = {
  // Trishul (trident) — Shiva
  trishul: (
    <>
      <line x1="24" y1="6" x2="24" y2="42" pathLength={100} />
      <path d="M14 16 Q14 6 18 6" pathLength={100} />
      <path d="M34 16 Q34 6 30 6" pathLength={100} />
      <line x1="14" y1="6" x2="14" y2="17" pathLength={100} />
      <line x1="34" y1="6" x2="34" y2="17" pathLength={100} />
      <path d="M14 16 Q24 24 34 16" pathLength={100} />
      <path d="M19 42 h10 l-1.5 4 h-7 Z" pathLength={100} />
    </>
  ),
  // Sudarshana chakra (discus) — Vishnu
  chakra: (
    <>
      <circle cx="24" cy="24" r="15" pathLength={100} />
      <circle cx="24" cy="24" r="5" pathLength={100} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 4) * i;
        const x1 = 24 + Math.cos(a) * 5;
        const y1 = 24 + Math.sin(a) * 5;
        const x2 = 24 + Math.cos(a) * 15;
        const y2 = 24 + Math.sin(a) * 15;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={100} />;
      })}
    </>
  ),
  // Lotus — Devi
  lotus: (
    <>
      <path d="M24 40 C16 34 16 22 24 12 C32 22 32 34 24 40 Z" pathLength={100} />
      <path d="M24 40 C14 38 10 30 10 22 C18 24 23 32 24 40 Z" pathLength={100} />
      <path d="M24 40 C34 38 38 30 38 22 C30 24 25 32 24 40 Z" pathLength={100} />
    </>
  ),
  // Ankusha (goad) — Ganesha
  ankusha: (
    <>
      <line x1="20" y1="42" x2="20" y2="14" pathLength={100} />
      <path d="M20 14 Q20 7 27 7 Q33 7 33 13" pathLength={100} />
      <path d="M20 16 q9 0 9 8" pathLength={100} />
    </>
  ),
  // Vel (spear) — Murugan
  vel: (
    <>
      <line x1="24" y1="20" x2="24" y2="44" pathLength={100} />
      <path d="M24 4 C18 12 18 18 24 22 C30 18 30 12 24 4 Z" pathLength={100} />
    </>
  ),
  // Gadaa (mace) — Hanuman
  gadaa: (
    <>
      <line x1="24" y1="44" x2="24" y2="20" pathLength={100} />
      <circle cx="24" cy="13" r="8" pathLength={100} />
      <line x1="18" y1="44" x2="30" y2="44" pathLength={100} />
    </>
  ),
};

export function DeityIcon({
  icon,
  className,
  strokeWidth = 2,
  animated = false,
}: {
  icon: DeityIconKey;
  className?: string;
  strokeWidth?: number;
  /** One-shot stroke-draw on first paint (docs/15 — supersedes the D22#1 hover-draw so the
   *  icon reads at rest per the "beautiful when nothing is moving" bar). Ends fully drawn;
   *  reduced motion completes it instantly. Opt-in: deity tiles + deity pages use it;
   *  smaller static usages (e.g. an Explore filter row) leave it off. */
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn(className, animated && "animate-deity-draw")}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[icon]}
    </svg>
  );
}
