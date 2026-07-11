import { describe, it, expect } from "vitest";
import { temples } from "@/data/temples";
import { slugify } from "./utils";
import { checkCoordinateInState, projectLngLat, parsePathRings, distanceToRings } from "./geo";
import { INDIA_STATES } from "./india-geo";

describe("parsePathRings", () => {
  it("parses a single ring", () => {
    const rings = parsePathRings("M0,0L10,0L10,10L0,10Z");
    expect(rings).toEqual([[[0, 0], [10, 0], [10, 10], [0, 10]]]);
  });

  it("parses multiple rings (a MultiPolygon's parts concatenated)", () => {
    const rings = parsePathRings("M0,0L5,0L5,5Z" + "M10,10L15,10L15,15Z");
    expect(rings).toHaveLength(2);
    expect(rings[0]).toEqual([[0, 0], [5, 0], [5, 5]]);
    expect(rings[1]).toEqual([[10, 10], [15, 10], [15, 15]]);
  });
});

describe("projectLngLat", () => {
  it("is deterministic", () => {
    expect(projectLngLat(78.0, 20.0)).toEqual(projectLngLat(78.0, 20.0));
  });

  it("increasing latitude moves the point up (smaller y — SVG y grows downward)", () => {
    const [, ySouth] = projectLngLat(78, 10);
    const [, yNorth] = projectLngLat(78, 30);
    expect(yNorth).toBeLessThan(ySouth);
  });
});

describe("checkCoordinateInState", () => {
  it("passes every real temple's coordinates against its own state", () => {
    for (const t of temples) {
      const slug = slugify(t.state);
      expect(
        checkCoordinateInState(t.coordinates, slug),
        `${t.name} (${t.coordinates.lat}, ${t.coordinates.lng}) should fall within "${t.state}"`,
      ).toBe(true);
    }
  });

  it("rejects a coordinate placed in an obviously wrong state", () => {
    // Golden Temple's real coordinates (Amritsar, Punjab) tested against Tamil Nadu,
    // ~2,700km away — far beyond the simplification tolerance (docs/07 §2.3).
    const golden = temples.find((t) => t.id === "golden-temple")!;
    expect(checkCoordinateInState(golden.coordinates, "tamil-nadu")).toBe(false);
  });

  it("returns false for an unknown state slug", () => {
    expect(checkCoordinateInState({ lat: 20, lng: 78 }, "not-a-real-state")).toBe(false);
  });

  it("measures distance to the closing (wraparound) edge, not just consecutive edges", () => {
    // Square with vertices bottom-left→bottom-right→top-right→top-left. Our path strings
    // do NOT repeat the first point, so the left edge (top-left → bottom-left) is the
    // implicit CLOSING edge. A point 1 unit left of the square's left edge is 1 unit from
    // the polygon — but only if the closing edge is checked. The old code skipped it and
    // reported the distance to the nearest corner (~50) instead.
    const ring: [number, number][] = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ];
    const point: [number, number] = [-1, 50];
    expect(distanceToRings(point, [ring])).toBeCloseTo(1, 5);
  });

  it("every INDIA_STATES entry has a non-empty, parseable path", () => {
    for (const s of INDIA_STATES) {
      const rings = parsePathRings(s.path);
      expect(rings.length, `${s.name} should have at least one ring`).toBeGreaterThan(0);
      for (const ring of rings) {
        expect(ring.length, `${s.name} ring should have at least 3 points`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
