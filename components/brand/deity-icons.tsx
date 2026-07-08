import type { ReactElement } from "react";
import type { DeityIcon as DeityIconKey } from "@/lib/deities";

/**
 * Six hand-built line icons for the deity tiles (and, later, the Explore deity
 * filter). Each is a symbol associated with the deity — icon leads identity, colour
 * only reinforces (DESIGN_SYSTEM §1.5). Stroke inherits `currentColor`.
 */

const paths: Record<DeityIconKey, ReactElement> = {
  // Trishul (trident) — Shiva
  trishul: (
    <>
      <line x1="24" y1="6" x2="24" y2="42" />
      <path d="M14 16 Q14 6 18 6" />
      <path d="M34 16 Q34 6 30 6" />
      <line x1="14" y1="6" x2="14" y2="17" />
      <line x1="34" y1="6" x2="34" y2="17" />
      <path d="M14 16 Q24 24 34 16" />
      <path d="M19 42 h10 l-1.5 4 h-7 Z" />
    </>
  ),
  // Sudarshana chakra (discus) — Vishnu
  chakra: (
    <>
      <circle cx="24" cy="24" r="15" />
      <circle cx="24" cy="24" r="5" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 4) * i;
        const x1 = 24 + Math.cos(a) * 5;
        const y1 = 24 + Math.sin(a) * 5;
        const x2 = 24 + Math.cos(a) * 15;
        const y2 = 24 + Math.sin(a) * 15;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </>
  ),
  // Lotus — Devi
  lotus: (
    <>
      <path d="M24 40 C16 34 16 22 24 12 C32 22 32 34 24 40 Z" />
      <path d="M24 40 C14 38 10 30 10 22 C18 24 23 32 24 40 Z" />
      <path d="M24 40 C34 38 38 30 38 22 C30 24 25 32 24 40 Z" />
    </>
  ),
  // Ankusha (goad) — Ganesha
  ankusha: (
    <>
      <line x1="20" y1="42" x2="20" y2="14" />
      <path d="M20 14 Q20 7 27 7 Q33 7 33 13" />
      <path d="M20 16 q9 0 9 8" />
    </>
  ),
  // Vel (spear) — Murugan
  vel: (
    <>
      <line x1="24" y1="20" x2="24" y2="44" />
      <path d="M24 4 C18 12 18 18 24 22 C30 18 30 12 24 4 Z" />
    </>
  ),
  // Gadaa (mace) — Hanuman
  gadaa: (
    <>
      <line x1="24" y1="44" x2="24" y2="20" />
      <circle cx="24" cy="13" r="8" />
      <line x1="18" y1="44" x2="30" y2="44" />
    </>
  ),
};

export function DeityIcon({
  icon,
  className,
  strokeWidth = 2,
}: {
  icon: DeityIconKey;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
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
