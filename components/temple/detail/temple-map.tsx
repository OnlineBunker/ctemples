import { ExternalLink, MapPin } from "lucide-react";
import { formatCoordinates } from "@/lib/format";
import { slugify } from "@/lib/utils";
import { INDIA_STATES } from "@/lib/india-geo";
import { projectLngLat, parsePathRings } from "@/lib/geo";
import type { Temple } from "@/lib/types";
import { FactRows } from "./fact-rows";

function stateBoundingBox(path: string) {
  const rings = parsePathRings(path);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const ring of rings) {
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * Section 14 — Find on the map (docs/06 §8, docs/07 §7 verbatim). A state-SCALE plot, not
 * the India-wide map (that's Explore's job) — reuses Phase 4's shared geometry (the same
 * `INDIA_STATES` path data and `projectLngLat` projection IndiaMap uses) rather than a
 * second coordinate system, by re-windowing the SVG `viewBox` to just this state's own
 * bounding box. No `nearbyAttractions` dots: that field has no coordinates in the schema
 * today, and plotting guessed positions would be a real fabrication (D12's spirit extends
 * to geography, not just visitor counts) — omitted rather than invented.
 */
export function TempleMap({ temple }: { temple: Temple }) {
  const { lat, lng } = temple.coordinates;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const geoUri = `geo:${lat},${lng}`;

  const stateGeo = INDIA_STATES.find((s) => s.slug === slugify(temple.state));
  const [tx, ty] = projectLngLat(lng, lat);

  const box = stateGeo ? stateBoundingBox(stateGeo.path) : null;
  const pad = box ? Math.max(box.width, box.height) * 0.12 : 0;
  const viewBox = box
    ? `${box.minX - pad} ${box.minY - pad} ${box.width + pad * 2} ${box.height + pad * 2}`
    : "0 0 1000 1100";
  const viewBoxWidth = box ? box.width + pad * 2 : 1000;
  const strokeWidth = viewBoxWidth / 300;
  const dotRadius = viewBoxWidth * 0.012;
  const haloRadius = viewBoxWidth * 0.024;

  return (
    <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
      <figure
        aria-label={`Map of ${temple.state} showing ${temple.name}`}
        className="relative m-0 aspect-[4/3] overflow-hidden rounded-card border border-line bg-canvas-soft"
      >
        <svg viewBox={viewBox} className="h-full w-full" aria-hidden>
          {stateGeo ? (
            <path
              d={stateGeo.path}
              fill="#F4EADF"
              stroke="#E5006D"
              strokeWidth={strokeWidth}
              fillRule="evenodd"
            />
          ) : null}
          <circle cx={tx} cy={ty} r={haloRadius} fill="#FCE0EE" />
          <circle cx={tx} cy={ty} r={dotRadius} fill="#E5006D" stroke="#FFFFFF" strokeWidth={strokeWidth * 0.6} />
        </svg>
      </figure>

      <div className="flex flex-col justify-center rounded-card border border-line bg-canvas-soft p-6">
        <FactRows
          rows={[
            { label: "Location", value: `${temple.city}, ${temple.state}` },
            {
              label: "Coordinates",
              // Mono readout per docs/07 §7 ("a mono coordinates caption") — the
              // cartographic convention for a coordinate value.
              value: <span className="font-mono text-sm">{formatCoordinates(temple.coordinates)}</span>,
            },
          ]}
        />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={directionsHref}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-magenta to-coral-deep px-5 py-2.5 font-body text-sm font-semibold text-white shadow-md transition-[filter] hover:brightness-95"
          >
            Get directions
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
          <a
            href={geoUri}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-5 py-2.5 font-body text-sm font-semibold text-plum transition-colors hover:border-magenta hover:text-magenta sm:hidden"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Open in Maps app
          </a>
        </div>
      </div>
    </div>
  );
}
