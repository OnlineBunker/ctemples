import { ExternalLink, MapPin } from "lucide-react";
import { formatCoordinates } from "@/lib/format";
import { regionPigment } from "@/lib/regions";
import type { Temple } from "@/lib/types";

// India's rough bounding box, used to place the marker within the plot.
const BOUNDS = { latMin: 6, latMax: 37.5, lngMin: 68, lngMax: 97.5 };

/**
 * A stylized coordinate plot rather than a live tile map (no API key / external calls in
 * this prototype). Plots the temple within India's bounding box on a graticule, reads out
 * the coordinates, and links out to a real map. Swap for a tile map when keys are added.
 */
export function TempleMap({ temple }: { temple: Temple }) {
  const { lat, lng } = temple.coordinates;
  const x = ((lng - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin)) * 100;
  const y = (1 - (lat - BOUNDS.latMin) / (BOUNDS.latMax - BOUNDS.latMin)) * 100;
  const pigment = regionPigment(temple.region);
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-brass/15 bg-nightstone-900">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (i + 1) * 10).map((p) => (
            <line key={`v${p}`} x1={p} y1="0" x2={p} y2="100" stroke="#C9A24B" strokeOpacity="0.08" strokeWidth="0.3" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (i + 1) * 10).map((p) => (
            <line key={`h${p}`} x1="0" y1={p} x2="100" y2={p} stroke="#C9A24B" strokeOpacity="0.08" strokeWidth="0.3" />
          ))}
        </svg>
        {/* marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <span
            aria-hidden
            className="absolute -bottom-1 left-1/2 h-6 w-6 -translate-x-1/2 animate-diya-flicker rounded-full"
            style={{ backgroundColor: pigment, opacity: 0.3, filter: "blur(6px)" }}
          />
          <MapPin className="relative h-7 w-7 drop-shadow-lg" style={{ color: pigment }} aria-hidden />
        </div>
        <span className="absolute bottom-3 left-4 font-mono text-[0.58rem] uppercase tracking-label text-limewash/40">
          Coordinate plot · India
        </span>
      </div>

      <div className="flex flex-col justify-center rounded-card border border-brass/15 bg-nightstone-800/40 p-6">
        <p className="eyebrow text-limewash/45">Location</p>
        <p className="mt-3 font-display text-2xl text-limewash">
          {temple.city}, {temple.state}
        </p>
        <p className="mt-2 font-mono text-sm text-brass">{formatCoordinates(temple.coordinates)}</p>
        <a
          href={gmaps}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-brass/40 px-5 py-2.5 font-mono text-[0.66rem] uppercase tracking-label text-brass transition-colors hover:bg-brass/10"
        >
          Open in Google Maps
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}
