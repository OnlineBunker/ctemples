import { describe, it, expect } from "vitest";
import {
  filterTemples,
  matchesQuery,
  sortTemples,
  collectFacet,
  collectTags,
  countActiveFilters,
  PUBLIC_SORT_OPTIONS,
} from "./filter";
import { makeTemple } from "./__fixtures__/temple";

const meenakshi = makeTemple({
  id: "meenakshi",
  name: "Meenakshi Amman",
  city: "Madurai",
  state: "Tamil Nadu",
  region: "South",
  deity: "Parvati",
  tags: ["Dravidian", "Living temple"],
  rating: 4.9,
  featured: true,
  costEstimates: [
    { fromCity: "Chennai", distanceKm: 460, travelTime: "", budget: "₹6,000 - ₹8,000 per person", midRange: "", luxury: "" },
    { fromCity: "Trichy", distanceKm: 130, travelTime: "", budget: "₹3,000 - ₹4,000 per person", midRange: "", luxury: "" },
    { fromCity: "Kochi", distanceKm: 270, travelTime: "", budget: "₹5,000 - ₹7,000 per person", midRange: "", luxury: "" },
  ],
});

const konark = makeTemple({
  id: "konark",
  name: "Konark Sun Temple",
  city: "Konark",
  state: "Odisha",
  region: "East",
  deity: "Surya",
  tags: ["UNESCO", "Kalinga"],
  rating: 4.6,
  featured: false,
  costEstimates: [
    { fromCity: "Bhubaneswar", distanceKm: 65, travelTime: "", budget: "₹2,500 - ₹3,500 per person", midRange: "", luxury: "" },
    { fromCity: "Kolkata", distanceKm: 500, travelTime: "", budget: "₹7,000 - ₹9,000 per person", midRange: "", luxury: "" },
    { fromCity: "Puri", distanceKm: 35, travelTime: "", budget: "₹1,800 - ₹2,500 per person", midRange: "", luxury: "" },
  ],
});

const khajuraho = makeTemple({
  id: "khajuraho",
  name: "Kandariya Mahadeva",
  city: "Khajuraho",
  state: "Madhya Pradesh",
  region: "Central",
  deity: "Shiva",
  tags: ["UNESCO", "Nagara"],
  rating: 4.7,
  featured: true,
});

const all = [meenakshi, konark, khajuraho];

describe("matchesQuery", () => {
  it("matches on name, city, deity, and tags, case-insensitively", () => {
    expect(matchesQuery(meenakshi, "madurai")).toBe(true);
    expect(matchesQuery(konark, "SURYA")).toBe(true);
    expect(matchesQuery(khajuraho, "nagara")).toBe(true);
    expect(matchesQuery(konark, "shiva")).toBe(false);
  });
  it("requires every term to match (AND semantics)", () => {
    expect(matchesQuery(meenakshi, "madurai dravidian")).toBe(true);
    expect(matchesQuery(meenakshi, "madurai kalinga")).toBe(false);
  });
  it("empty query matches everything", () => {
    expect(matchesQuery(konark, "   ")).toBe(true);
  });
});

describe("filterTemples", () => {
  it("filters by region (OR within facet)", () => {
    const r = filterTemples(all, { regions: ["South", "East"] });
    expect(r.map((t) => t.id).sort()).toEqual(["konark", "meenakshi"]);
  });
  it("combines facets with AND across facets", () => {
    const r = filterTemples(all, { regions: ["Central"], deities: ["Shiva"] });
    expect(r.map((t) => t.id)).toEqual(["khajuraho"]);
  });
  it("intersects tag filter with search query", () => {
    const r = filterTemples(all, { tags: ["UNESCO"], query: "sun" });
    expect(r.map((t) => t.id)).toEqual(["konark"]);
  });
  it("returns empty when nothing matches", () => {
    expect(filterTemples(all, { query: "antarctica" })).toEqual([]);
  });
});

describe("sortTemples", () => {
  it("sorts by rating desc", () => {
    expect(sortTemples(all, "rating").map((t) => t.id)).toEqual(["meenakshi", "khajuraho", "konark"]);
  });
  it("sorts A–Z by name", () => {
    expect(sortTemples(all, "name").map((t) => t.name)[0]).toBe("Kandariya Mahadeva");
  });
  it("sorts by lowest starting cost", () => {
    // konark's cheapest budget (₹1,800) is the lowest of the three.
    expect(sortTemples(all, "cost").map((t) => t.id)[0]).toBe("konark");
  });
  it("featured sort puts featured first, then rating", () => {
    expect(sortTemples(all, "featured").map((t) => t.id)).toEqual(["meenakshi", "khajuraho", "konark"]);
  });
  it("does not mutate the input array", () => {
    const before = all.map((t) => t.id);
    sortTemples(all, "name");
    expect(all.map((t) => t.id)).toEqual(before);
  });
  it("'popularity' sorts by the precomputed score — not by featured or rating alone", () => {
    // "high" is unfeatured with the lowest rating but the highest score: it must still
    // rank first, proving the score (docs/09 §4) drives the order, not featured/rating.
    const high = makeTemple({ id: "high", name: "High Score", rating: 4.0, featured: false, popularityScore: 90 });
    const mid = makeTemple({ id: "mid", name: "Mid Score", rating: 4.9, featured: true, popularityScore: 50 });
    const tied = makeTemple({ id: "tied", name: "Zebra Score", rating: 4.5, featured: false, popularityScore: 50 });
    // "mid" and "tied" tie on score (50); rating (4.9 > 4.5) breaks the tie.
    expect(sortTemples([tied, high, mid], "popularity").map((t) => t.id)).toEqual(["high", "mid", "tied"]);
  });

  it("'popularity' treats a missing score as 0", () => {
    const scored = makeTemple({ id: "scored", popularityScore: 10, rating: 4.0 });
    const unscored = makeTemple({ id: "unscored", popularityScore: undefined, rating: 4.9 });
    expect(sortTemples([unscored, scored], "popularity").map((t) => t.id)).toEqual(["scored", "unscored"]);
  });
});

describe("PUBLIC_SORT_OPTIONS", () => {
  it("exposes exactly the 3 public options: rating, popularity, name", () => {
    expect(PUBLIC_SORT_OPTIONS.map((o) => o.key)).toEqual(["rating", "popularity", "name"]);
  });
});

describe("facets", () => {
  it("counts single-value facets, sorted by frequency", () => {
    const deities = collectFacet(all, "deity");
    expect(deities.map((f) => f.value)).toContain("Shiva");
    expect(deities.find((f) => f.value === "Shiva")?.count).toBe(1);
  });
  it("counts multi-valued tags", () => {
    const tags = collectTags(all);
    expect(tags.find((f) => f.value === "UNESCO")?.count).toBe(2);
    // most frequent tag sorts first
    expect(tags[0].value).toBe("UNESCO");
  });
});

describe("countActiveFilters", () => {
  it("counts query + each selected facet value", () => {
    expect(countActiveFilters({ query: "sun", regions: ["East"], tags: ["UNESCO", "Kalinga"] })).toBe(4);
    expect(countActiveFilters({ query: "   " })).toBe(0);
    expect(countActiveFilters({})).toBe(0);
  });
});
