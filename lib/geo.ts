import { INDIA_STATES, GEO_PROJECTION } from "./india-geo";

/**
 * Point-in-polygon support for the generated map geometry (docs/07 §2.3). Kept separate
 * from lib/india-geo.ts (a generated file, never hand-edited) — this module reuses that
 * file's SVG path strings and projection constants rather than duplicating ring
 * coordinates a second time (which would roughly double the geometry payload).
 */

/** Projects a raw (lng, lat) into the same viewBox space as INDIA_STATES' paths. */
export function projectLngLat(lng: number, lat: number): [number, number] {
  const { cosMeanLat, pxMin, pyMin, scale, offsetX, offsetY } = GEO_PROJECTION;
  const x = lng * cosMeanLat;
  const y = -lat;
  return [(x - pxMin) * scale + offsetX, (y - pyMin) * scale + offsetY];
}

/** Parses one of our own generated "Mx,yLx,yLx,y...ZMx,y...Z" path strings into rings. */
export function parsePathRings(d: string): [number, number][][] {
  const rings: [number, number][][] = [];
  let current: [number, number][] = [];
  const commandRe = /([ML])(-?[\d.]+),(-?[\d.]+)|Z/g;
  let match: RegExpExecArray | null;
  while ((match = commandRe.exec(d))) {
    if (match[0] === "Z") {
      if (current.length) rings.push(current);
      current = [];
    } else {
      current.push([parseFloat(match[2]), parseFloat(match[3])]);
    }
  }
  return rings;
}

/** Even-odd point-in-polygon ray casting, matching the path's own fill-rule. */
function pointInRing(point: [number, number], ring: [number, number][]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInRings(point: [number, number], rings: [number, number][][]): boolean {
  let inside = false;
  for (const ring of rings) {
    if (pointInRing(point, ring)) inside = !inside;
  }
  return inside;
}

function distanceToSegment(p: [number, number], a: [number, number], b: [number, number]): number {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Exported for unit testing the closing-edge (wraparound) distance behavior. */
export function distanceToRings(point: [number, number], rings: [number, number][][]): number {
  let min = Infinity;
  for (const ring of rings) {
    // Walk every edge INCLUDING the closing one (last vertex → first), the same
    // wraparound pointInRing does — our path strings don't repeat the first point at the
    // end, so omitting it would skip a real edge and over-report the distance for a point
    // whose nearest boundary happens to lie on that closing segment.
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const d = distanceToSegment(point, ring[j], ring[i]);
      if (d < min) min = d;
    }
  }
  return min;
}

/** Viewbox-units of slack (docs/07 §1: "a navigation instrument, not GIS"). The 0.2%
 *  simplification pass (needed to hold the 80KB geometry budget) occasionally pinches
 *  off thin peninsulas/islands by a few units — e.g. Rameswaram's Pamban Island sits
 *  ~8 viewBox-units outside the simplified Tamil Nadu boundary despite being correctly
 *  coordinated. This absorbs that class of artifact without hiding a temple placed in
 *  the wrong state outright (which would miss by tens–hundreds of units, not single
 *  digits). */
const BOUNDARY_TOLERANCE = 12;

const ringsBySlug = new Map<string, [number, number][][]>();
function getRings(slug: string): [number, number][][] | undefined {
  if (!ringsBySlug.has(slug)) {
    const state = INDIA_STATES.find((s) => s.slug === slug);
    ringsBySlug.set(slug, state ? parsePathRings(state.path) : []);
  }
  return ringsBySlug.get(slug);
}

/**
 * Does {lat, lng} fall within the named state's boundary (docs/07 §2.3)? Joins the
 * validation suite (docs/09 §6) so the map and the data can never disagree silently.
 * `stateSlug` must be `slugify(temple.state)` — the same join key INDIA_STATES uses.
 */
export function checkCoordinateInState(
  coordinates: { lat: number; lng: number },
  stateSlug: string,
): boolean {
  const rings = getRings(stateSlug);
  if (!rings || rings.length === 0) return false;
  const point = projectLngLat(coordinates.lng, coordinates.lat);
  if (pointInRings(point, rings)) return true;
  return distanceToRings(point, rings) <= BOUNDARY_TOLERANCE;
}
