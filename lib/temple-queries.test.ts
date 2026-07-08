import { describe, it, expect } from "vitest";
import {
  findTempleById,
  pickFeatured,
  pickRelated,
  countByRegion,
  countByState,
  topByState,
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
