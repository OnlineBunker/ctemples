import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * Geometry pipeline (docs/07 §2, D16). One-time script, committed output.
 *
 * Input: scripts/geo-src/india-states-simplified.geojson — datameet/maps' States/Admin2
 * shapefile (36 features, WGS84 lon/lat), already run once through mapshaper CLI:
 *   mapshaper Admin2.shp -simplify visvalingam keep-shapes 5% \
 *     -filter-fields ST_NM -rename-fields state=ST_NM \
 *     -o format=geojson precision=0.01 india-states-simplified.geojson
 * (that CLI pass isn't re-run here — Node has no shapefile reader — so the checked-in
 * intermediate GeoJSON is itself part of the committed pipeline input, matching the
 * source's own license terms; see the attribution note below.)
 *
 * This script: renames 2 states to the canonical spelling used in data/temples.ts,
 * projects lon/lat -> an SVG viewBox (equirectangular + cos(meanLat) aspect correction,
 * one shared global scale so relative state sizes stay geographically honest), emits
 * SVG path data + label points + areas, plus real lon/lat centroids for the future
 * detail-page plot (file 06 §8) and a per-state normalized 48x48 silhouette (file 07 §8).
 *
 * Run: node scripts/build-india-geo.mjs
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_PATH = resolve(__dirname, "geo-src/india-states-simplified.geojson");
const OUT_PATH = resolve(__dirname, "../lib/india-geo.ts");

const VIEW_W = 1000;
const VIEW_H = 1100;
const PAD = 12;
const SILHOUETTE_BOX = 48;
const SILHOUETTE_PAD = 3;

// datameet/maps spells these with "&"; data/temples.ts (and every other canonical name
// in this codebase) spells them out — the join key is slugify(name), so they must match.
const NAME_FIXUPS = {
  "Andaman & Nicobar": "Andaman and Nicobar Islands",
  "Jammu & Kashmir": "Jammu and Kashmir",
};

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Shoelace area + area-weighted centroid of a single ring (array of [x,y]). */
function ringAreaAndCentroid(ring) {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area /= 2;
  if (area === 0) {
    // degenerate (a straight-line sliver) — fall back to a plain point average.
    const n = ring.length - 1;
    const avg = ring.slice(0, n).reduce((a, [x, y]) => [a[0] + x / n, a[1] + y / n], [0, 0]);
    return { area: 0, centroid: avg };
  }
  cx /= 6 * area;
  cy /= 6 * area;
  return { area: Math.abs(area), centroid: [cx, cy] };
}

/** Every [lon, lat] point in a Polygon/MultiPolygon geometry, flattened. */
function allPoints(geometry) {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polys.flat(2);
}

/** Outer rings only (index 0 of each polygon part) — used for area/centroid/label. */
function outerRings(geometry) {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polys.map((rings) => rings[0]);
}

/** All rings (outer + holes) of every part — used for the rendered path. */
function everyRing(geometry) {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polys.flat();
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function ringToPathD(ring, project) {
  return ring
    .map(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      return `${i === 0 ? "M" : "L"}${round1(x)},${round1(y)}`;
    })
    .join("") + "Z";
}

// ─────────────────────────────── Load + rename ───────────────────────────────

const raw = JSON.parse(readFileSync(SRC_PATH, "utf8"));
const features = raw.features.map((f) => ({
  ...f,
  properties: { state: NAME_FIXUPS[f.properties.state] ?? f.properties.state },
}));

if (features.length !== 36) {
  throw new Error(`Expected 36 states/UTs, got ${features.length}`);
}

// ─────────────────────────── Global projection (shared) ───────────────────────────
// Equirectangular with a cos(meanLat) longitude correction so India's shape reads
// correctly (a plain lon/lat plot stretches it noticeably east-west at this latitude).

let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
for (const f of features) {
  for (const [lon, lat] of allPoints(f.geometry)) {
    if (lon < lonMin) lonMin = lon;
    if (lon > lonMax) lonMax = lon;
    if (lat < latMin) latMin = lat;
    if (lat > latMax) latMax = lat;
  }
}
const meanLatRad = ((latMin + latMax) / 2) * (Math.PI / 180);
const cosMeanLat = Math.cos(meanLatRad);

function rawProject(lon, lat) {
  return [lon * cosMeanLat, -lat];
}

let pxMin = Infinity, pxMax = -Infinity, pyMin = Infinity, pyMax = -Infinity;
for (const f of features) {
  for (const [lon, lat] of allPoints(f.geometry)) {
    const [x, y] = rawProject(lon, lat);
    if (x < pxMin) pxMin = x;
    if (x > pxMax) pxMax = x;
    if (y < pyMin) pyMin = y;
    if (y > pyMax) pyMax = y;
  }
}
const scale = Math.min((VIEW_W - 2 * PAD) / (pxMax - pxMin), (VIEW_H - 2 * PAD) / (pyMax - pyMin));
// Center the projected shape within the viewBox on both axes.
const usedW = (pxMax - pxMin) * scale;
const usedH = (pyMax - pyMin) * scale;
const offsetX = (VIEW_W - usedW) / 2;
const offsetY = (VIEW_H - usedH) / 2;

function project(lon, lat) {
  const [x, y] = rawProject(lon, lat);
  return [(x - pxMin) * scale + offsetX, (y - pyMin) * scale + offsetY];
}

// ─────────────────────────────── Per-state geometry ───────────────────────────────

const states = features
  .map((f) => {
    const { state } = f.properties;
    const slug = slugify(state);

    const path = everyRing(f.geometry)
      .map((ring) => ringToPathD(ring, project))
      .join("");

    // Label point + area: the largest part by area (avoids anchoring a label between
    // scattered islands, e.g. Andaman & Nicobar, Lakshadweep).
    const parts = outerRings(f.geometry).map((ring) => {
      const projected = ring.map(([lon, lat]) => project(lon, lat));
      return ringAreaAndCentroid(projected);
    });
    const biggest = parts.reduce((a, b) => (b.area > a.area ? b : a));
    const totalArea = parts.reduce((sum, p) => sum + p.area, 0);

    // Real lon/lat centroid (of the largest part), for the future detail-page plot —
    // the state-scale map needs true geographic coordinates, not viewBox pixels.
    const rawBiggest = outerRings(f.geometry)
      .map((ring) => ringAreaAndCentroid(ring))
      .reduce((a, b) => (b.area > a.area ? b : a));

    // Per-state silhouette: same projected points, re-normalized into their OWN
    // 48x48 box (independent scale/offset per state — this is the point of a
    // "silhouette," not a mini version of the national map).
    const statePts = outerRings(f.geometry).flatMap((ring) =>
      ring.map(([lon, lat]) => rawProject(lon, lat)),
    );
    const sx = statePts.map((p) => p[0]);
    const sy = statePts.map((p) => p[1]);
    const sMinX = Math.min(...sx), sMaxX = Math.max(...sx);
    const sMinY = Math.min(...sy), sMaxY = Math.max(...sy);
    const box = SILHOUETTE_BOX - 2 * SILHOUETTE_PAD;
    const sScale = Math.min(box / (sMaxX - sMinX || 1), box / (sMaxY - sMinY || 1));
    const sUsedW = (sMaxX - sMinX) * sScale;
    const sUsedH = (sMaxY - sMinY) * sScale;
    const sOffX = (SILHOUETTE_BOX - sUsedW) / 2;
    const sOffY = (SILHOUETTE_BOX - sUsedH) / 2;
    const silhouetteProject = (lon, lat) => {
      const [x, y] = rawProject(lon, lat);
      return [(x - sMinX) * sScale + sOffX, (y - sMinY) * sScale + sOffY];
    };
    const silhouette = outerRings(f.geometry)
      .map((ring) => ringToPathD(ring, silhouetteProject))
      .join("");

    return {
      slug,
      name: state,
      path,
      labelPoint: [round1(biggest.centroid[0]), round1(biggest.centroid[1])],
      area: Math.round(totalArea * 100) / 100,
      centroid: [round1(rawBiggest.centroid[0]), round1(rawBiggest.centroid[1])],
      silhouette,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name)); // docs/07 §6: tab order alphabetical

// Callout-marker threshold (docs/07 §5#1): rendered area < 44px² at the assumed
// default desktop render width (60% of a ~1000px Explore column, docs/07 §3 — i.e. the
// 1000-unit-wide viewBox rendered at ~600 CSS px, so 1 viewBox unit ≈ 0.6px, and
// 44px² ≈ 44 / 0.6² ≈ 122 viewBox-unit²).
const CALLOUT_AREA_THRESHOLD = 122;
const calloutSlugs = states.filter((s) => s.area < CALLOUT_AREA_THRESHOLD).map((s) => s.slug);

// ─────────────────────────────────── Emit ───────────────────────────────────

const stateEntries = states
  .map(
    (s) =>
      `  { slug: "${s.slug}", name: "${s.name}", path: "${s.path}", labelPoint: [${s.labelPoint[0]}, ${s.labelPoint[1]}], area: ${s.area} }`,
  )
  .join(",\n");

const centroidEntries = states
  .map((s) => `  "${s.slug}": [${s.centroid[0]}, ${s.centroid[1]}]`)
  .join(",\n");

// Projection constants, re-exported so lib/geo.ts can project a raw (lng, lat) into the
// SAME viewBox space as INDIA_STATES' paths — without duplicating the ring coordinates
// (which would roughly double this file's size). checkCoordinateInState (docs/07 §2.3)
// parses the path string back into rings at call time instead.
const projectionConstants = {
  cosMeanLat,
  pxMin,
  pyMin,
  scale,
  offsetX,
  offsetY,
};

const silhouetteEntries = states
  .map((s) => `  "${s.slug}": "${s.silhouette}"`)
  .join(",\n");

const output = `// GENERATED FILE — do not hand-edit (CLAUDE.md standing prohibition).
// Regenerate: node scripts/build-india-geo.mjs
// Source: datameet/maps States/Admin2 shapefile (CC BY 4.0, DataMeet community —
// https://github.com/datameet/maps), Survey-of-India-aligned state boundaries (D16).
// Attribution (docs/07 §2.4) must ship wherever this geometry renders.

export const INDIA_VIEWBOX = "0 0 ${VIEW_W} ${VIEW_H}";

export interface IndiaStateGeometry {
  slug: string;
  name: string;
  /** SVG path 'd' attribute, viewBox-space, evenodd fill rule for holes. */
  path: string;
  /** Visual label anchor (viewBox-space) — the centroid of the geometry's largest part. */
  labelPoint: [number, number];
  /** Rendered area in viewBox-unit² (viewBox width ≈ 600 CSS px at the default 60% desktop
   *  column, docs/07 §5#1) — states under ~44px² get a callout marker instead of a direct
   *  polygon target. */
  area: number;
}

export const INDIA_STATES: IndiaStateGeometry[] = [
${stateEntries}
];

/** Real-world [lng, lat] centroid per state slug — for the state-scale detail-page plot
 *  (docs/06 §8, Phase 5), not the national map (which uses the viewBox-space labelPoint). */
export const STATE_CENTROIDS: Record<string, [number, number]> = {
${centroidEntries}
};

/** Each state's outline normalized into its own 48×48 box (docs/07 §8) — for the
 *  homepage StateTile icon upgrade. Independent per-state scale, not a crop of the
 *  national map. */
export const STATE_SILHOUETTES: Record<string, string> = {
${silhouetteEntries}
};

/** Slugs whose national-map area falls under the callout-marker threshold (docs/07 §5#1)
 *  — computed at build time from real geometry, not hardcoded. */
export const CALLOUT_STATE_SLUGS: string[] = ${JSON.stringify(calloutSlugs)};

/** Projection constants (viewBox-space) — lib/geo.ts uses these to project a raw
 *  (lng, lat) coordinate into the same space as INDIA_STATES' paths, for
 *  checkCoordinateInState (docs/07 §2.3). Not for hand use elsewhere. */
export const GEO_PROJECTION = ${JSON.stringify(projectionConstants, null, 2)};
`;

writeFileSync(OUT_PATH, output);

const sizeKB = Buffer.byteLength(output, "utf8") / 1024;
console.log(`Wrote ${OUT_PATH}`);
console.log(`  ${states.length} states/UTs, ${sizeKB.toFixed(1)}KB`);
console.log(`  Callout-marker states (area < ${CALLOUT_AREA_THRESHOLD}): ${calloutSlugs.join(", ")}`);
if (sizeKB > 80) {
  console.warn(`  WARNING: exceeds the 80KB budget (docs/07 §2.2) — re-simplify at 3% and re-run.`);
}
