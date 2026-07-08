import { describe, it, expect } from "vitest";
import {
  findTempleById,
  pickFeatured,
  pickRelated,
  countByRegion,
  countByState,
  topByState,
  pickByDeity,
  pickByArchitecturalStyle,
  pickWithinRadius,
} from "./temple-queries";
import { makeTemple } from "./__fixtures__/temple";

const south1 = makeTemple({ id: "s1", region: "South", state: "Tamil Nadu", deity: "Shiva", tags: ["Dravidian", "UNESCO"], rating: 4.9, featured: true });
const south2 = makeTemple({ id: "s2", region: "South", state: "Kerala", deity: "Vishnu", tags: ["Dravidian"], rating: 4.5, featured: false });
const east1 = makeTemple({ id: "e1", region: "East", state: "Odisha", deity: "Surya", tags: ["UNESCO", "Kalinga"], rating: 4.7, featured: true });
const central1 = makeTemple({ id: "c1", region: "Central", state: "Madhya Pradesh", deity: "Shiva", tags: ["Nagara"], rating: 4.6, featured: false });
const south3 = makeTemple({ id: "s3", region: "South", state: "Tamil Nadu", deity: "Shiva", tags: ["Dravidian"], rating: 4.4, featured: false });

const all = [south1, south2, east1, central1];

describe("findTempleById", () => {
  it("finds an existing temple", () => {
    expect(findTempleById(all, "e1")).toBe(east1);
  });
  it("returns null for a missing id", () => {
    expect(findTempleById(all, "nope")).toBeNull();
  });
});

describe("pickFeatured", () => {
  it("returns only featured temples, highest rating first", () => {
    expect(pickFeatured(all).map((t) => t.id)).toEqual(["s1", "e1"]);
  });
  it("respects a limit", () => {
    expect(pickFeatured(all, 1).map((t) => t.id)).toEqual(["s1"]);
  });
});

describe("pickRelated", () => {
  it("prefers same region, then shared deity/tags, and excludes self", () => {
    const related = pickRelated(all, south1, 3);
    expect(related.map((t) => t.id)).not.toContain("s1");
    // s2 shares region+state-family+tag; ranks first for the South temple
    expect(related[0].id).toBe("s2");
  });
  it("ranks a shared-deity/tag temple above an unrelated one", () => {
    const related = pickRelated(all, south1, 3);
    // c1 shares deity (Shiva); e1 shares only a UNESCO tag — c1 should rank ahead
    const ids = related.map((t) => t.id);
    expect(ids.indexOf("c1")).toBeLessThan(ids.indexOf("e1"));
  });
  it("caps at the requested limit", () => {
    expect(pickRelated(all, south1, 2)).toHaveLength(2);
  });
  it("recognizes shared deity from free-text prose, not exact string equality", () => {
    // Real data never repeats a deity string verbatim (e.g. two Jyotirlingas are each
    // worded differently) — the ranking must key off deity membership, not ===.
    const kedarnath = makeTemple({
      id: "kedarnath",
      region: "North",
      state: "Uttarakhand",
      deity: "Kedarnath (Shiva), one of the twelve Jyotirlingas and part of the Panch Kedar",
      tags: ["Trekking"],
      rating: 4.9,
    });
    const somnath = makeTemple({
      id: "somnath",
      region: "West",
      state: "Gujarat",
      deity: "Somnath (Shiva), revered as the first among the twelve Jyotirlingas",
      tags: ["Coastal"],
      rating: 4.8,
    });
    const unrelated = makeTemple({
      id: "unrelated",
      region: "East",
      state: "Odisha",
      deity: "Surya (the Sun God)",
      tags: ["Trekking"], // shares a tag with kedarnath, but no deity
      rating: 4.7,
    });
    const related = pickRelated([kedarnath, somnath, unrelated], kedarnath, 3);
    const ids = related.map((t) => t.id);
    // somnath shares only the "shiva" deity (+2); unrelated shares only a tag (+1).
    expect(ids.indexOf("somnath")).toBeLessThan(ids.indexOf("unrelated"));
  });
});

describe("countByRegion", () => {
  it("tallies every region, including zeroes", () => {
    const counts = countByRegion(all);
    expect(counts.South).toBe(2);
    expect(counts.East).toBe(1);
    expect(counts.Central).toBe(1);
    expect(counts.North).toBe(0);
    expect(counts.Northeast).toBe(0);
    expect(counts.West).toBe(0);
  });
});

describe("countByState", () => {
  const grouped = countByState([south1, south2, east1, central1, south3]);
  it("groups by state with a slug, richest first", () => {
    expect(grouped[0]).toMatchObject({ state: "Tamil Nadu", slug: "tamil-nadu", count: 2 });
  });
  it("carries the region and slugifies multi-word states", () => {
    const kerala = grouped.find((g) => g.state === "Kerala");
    expect(kerala).toMatchObject({ slug: "kerala", region: "South", count: 1 });
    expect(grouped.find((g) => g.state === "Madhya Pradesh")?.slug).toBe("madhya-pradesh");
  });
  it("lists every distinct state exactly once", () => {
    expect(grouped).toHaveLength(4);
  });
});

describe("topByState", () => {
  it("returns a state's temples, highest rating first, capped", () => {
    const tn = topByState([south1, south2, east1, central1, south3], "Tamil Nadu");
    expect(tn.map((t) => t.id)).toEqual(["s1", "s3"]);
  });
  it("returns [] for a state with no temples", () => {
    expect(topByState(all, "Goa")).toEqual([]);
  });
});

describe("pickByDeity", () => {
  it("returns temples sharing a canonical deity, excluding self, highest rating first", () => {
    const result = pickByDeity([south1, south2, east1, central1, south3], south1);
    // south1 (4.9, self, excluded), central1 (4.6, "Shiva"), south3 (4.4, "Shiva") share
    // south1's deity; south2 ("Vishnu") and east1 ("Surya") do not.
    expect(result.map((t) => t.id)).toEqual(["c1", "s3"]);
  });
  it("returns [] when no other temple shares the deity", () => {
    expect(pickByDeity([south2, south1], south2)).toEqual([]);
  });
});

describe("pickByArchitecturalStyle", () => {
  const dravidianA = makeTemple({ id: "d1", architecturalStyleSlug: "dravidian", rating: 4.9 });
  const dravidianB = makeTemple({ id: "d2", architecturalStyleSlug: "dravidian", rating: 4.5 });
  const kalinga = makeTemple({ id: "k1", architecturalStyleSlug: "kalinga", rating: 4.8 });

  it("matches on architecturalStyleSlug, excludes self, highest rating first", () => {
    const result = pickByArchitecturalStyle([dravidianA, dravidianB, kalinga], dravidianA);
    expect(result.map((t) => t.id)).toEqual(["d2"]);
  });
  it("returns [] when no other temple shares the style", () => {
    expect(pickByArchitecturalStyle([dravidianA, dravidianB, kalinga], kalinga)).toEqual([]);
  });
});

describe("pickWithinRadius", () => {
  // Near the equator, 1 degree of longitude is ~111.2 km — makes expected distances exact.
  const near = makeTemple({ id: "near", coordinates: { lat: 0, lng: 0.5 } }); // ~55.6 km
  const mid = makeTemple({ id: "mid", coordinates: { lat: 0, lng: 1.0 } }); // ~111.2 km
  const far = makeTemple({ id: "far", coordinates: { lat: 0, lng: 2.0 } }); // ~222.4 km
  const self = makeTemple({ id: "self", coordinates: { lat: 0, lng: 0 } }); // 0 km — excluded

  it("returns temples within the radius, nearest first, excluding the exact query point", () => {
    const result = pickWithinRadius([near, mid, far, self], 0, 0, 150);
    expect(result.map((r) => r.temple.id)).toEqual(["near", "mid"]);
    expect(result[0].distanceKm).toBeCloseTo(55.6, 0);
  });
  it("respects a limit", () => {
    const result = pickWithinRadius([near, mid, far], 0, 0, 300, 1);
    expect(result.map((r) => r.temple.id)).toEqual(["near"]);
  });
  it("returns [] when nothing is within range", () => {
    expect(pickWithinRadius([far], 0, 0, 50)).toEqual([]);
  });
});
