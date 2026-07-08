import { cn } from "@/lib/utils";

/**
 * Kolam-inspired line geometry — concentric octagons, circles, and a radial burst.
 * Purely decorative (aria-hidden); stroke inherits `currentColor`. Used as a soft
 * backdrop motif in the hero and methodology teaser (DESIGN.md graphic language).
 */
export function KolamMotif({
  className,
  strokeWidth = 0.75,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  const octagon = (r: number) =>
    Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI / 4) * i - Math.PI / 8;
      return `${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`;
    }).join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      {[46, 36, 26].map((r) => (
        <polygon key={`o-${r}`} points={octagon(r)} opacity={0.6} />
      ))}
      {[46, 33, 20, 9].map((r) => (
        <circle key={`c-${r}`} cx="50" cy="50" r={r} opacity={0.45} />
      ))}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (Math.PI / 8) * i;
        return (
          <line
            key={`r-${i}`}
            x1={(50 + Math.cos(a) * 9).toFixed(2)}
            y1={(50 + Math.sin(a) * 9).toFixed(2)}
            x2={(50 + Math.cos(a) * 46).toFixed(2)}
            y2={(50 + Math.sin(a) * 46).toFixed(2)}
            opacity={0.25}
          />
        );
      })}
      <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" opacity={0.7} />
    </svg>
  );
}
