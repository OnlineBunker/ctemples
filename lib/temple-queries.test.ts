import { describe, it, expect } from "vitest";
import { findTempleById, pickFeatured, pickRelated, countByRegion } from "./temple-queries";
import { makeTemple } from "./__fixtures__/temple";

const south1 = makeTemple({ id: "s1", region: "South", state: "Tamil Nadu", deity: "Shiva", tags: ["Dravidian", "UNESCO"], rating: 4.9, featured: true });
const south2 = makeTemple({ id: "s2", region: "South", state: "Kerala", deity: "Vishnu", tags: ["Dravidian"], rating: 4.5, featured: false });
const east1 = makeTemple({ id: "e1", region: "East", state: "Odisha", deity: "Surya", tags: ["UNESCO", "Kalinga"], rating: 4.7, featured: true });
const central1 = makeTemple({ id: "c1", region: "Central", state: "Madhya Pradesh", deity: "Shiva", tags: ["Nagara"], rating: 4.6, featured: false });

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
