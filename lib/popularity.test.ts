import { describe, it, expect } from "vitest";
import { temples } from "@/data/temples";
import wikiPageviews from "@/data/wiki-pageviews.json";
import popularity from "@/data/popularity.json";
import { computeProminence, computePopularityScore } from "./popularity";

describe("computeProminence", () => {
  it("gives UNESCO World Heritage the highest prominence", () => {
    expect(computeProminence(["UNESCO World Heritage"], false)).toBe(1.0);
  });

  it("gives Jyotirlinga/Char Dham/Shakti Pitha 0.9", () => {
    expect(computeProminence(["Jyotirlinga"], false)).toBe(0.9);
    expect(computeProminence(["Char Dham"], false)).toBe(0.9);
    expect(computeProminence(["Shakti Pitha"], false)).toBe(0.9);
  });

  it("takes the highest prominence when a temple has multiple qualifying tags", () => {
    expect(computeProminence(["Pilgrimage", "UNESCO World Heritage", "Jyotirlinga"], false)).toBe(1.0);
  });

  it("falls back to 0.5 for a featured temple with no prominent tag", () => {
    expect(computeProminence(["Pilgrimage", "Coastal"], true)).toBe(0.5);
  });

  it("falls back to 0.2 for a non-featured temple with no prominent tag", () => {
    expect(computeProminence(["Pilgrimage", "Coastal"], false)).toBe(0.2);
  });
});

describe("computePopularityScore", () => {
  it("gives the highest-view temple in a corpus a full 0.60 views contribution", () => {
    const score = computePopularityScore({
      wikiViews: 1000,
      maxWikiViews: 1000,
      tags: [],
      featured: false,
      rating: 3.5, // rating term contributes 0
    });
    // 100 * (0.60 * 1 + 0.25 * 0.2 + 0.15 * 0) = 100 * 0.65 = 65
    expect(score).toBe(65);
  });

  it("scales the rating term with clamp((rating-3.5)/1.5, 0, 1)", () => {
    const atFloor = computePopularityScore({ wikiViews: 0, maxWikiViews: 100, tags: [], featured: false, rating: 3.5 });
    const atCeiling = computePopularityScore({ wikiViews: 0, maxWikiViews: 100, tags: [], featured: false, rating: 5 });
    expect(atFloor).toBeLessThan(atCeiling);
    // 100 * 0.25 * 0.2 = 5 (views term is 0 since wikiViews is 0)
    expect(atFloor).toBe(5);
    // 100 * (0.25*0.2 + 0.15*1) = 100 * (0.05 + 0.15) = 20
    expect(atCeiling).toBe(20);
  });

  it("clamps the rating term at 1 even above the ceiling rating", () => {
    const over = computePopularityScore({ wikiViews: 0, maxWikiViews: 100, tags: [], featured: false, rating: 5 });
    const wayOver = computePopularityScore({ wikiViews: 0, maxWikiViews: 100, tags: [], featured: false, rating: 10 });
    expect(over).toBe(wayOver);
  });

  it("returns 0 views contribution when maxWikiViews is 0 (avoids log10(1)/log10(1) = NaN)", () => {
    const score = computePopularityScore({ wikiViews: 0, maxWikiViews: 0, tags: [], featured: false, rating: 3.5 });
    expect(Number.isNaN(score)).toBe(false);
    expect(score).toBe(5); // just the 0.25 * 0.2 prominence-floor term
  });

  it("is deterministic for identical inputs", () => {
    const input = { wikiViews: 42000, maxWikiViews: 700000, tags: ["Jyotirlinga"], featured: true, rating: 4.8 };
    expect(computePopularityScore(input)).toBe(computePopularityScore({ ...input }));
  });
});

describe("data/popularity.json", () => {
  it("stays in sync with computePopularityScore over the live data/temples.ts + data/wiki-pageviews.json (regenerate with `npm run popularity` if this fails)", () => {
    const viewsById = new Map(wikiPageviews.entries.map((e) => [e.id, e.wikiViews]));
    const maxWikiViews = Math.max(...wikiPageviews.entries.map((e) => e.wikiViews));
    const scoreById = new Map(popularity.map((p) => [p.id, p.score]));

    expect(popularity).toHaveLength(temples.length);
    for (const t of temples) {
      const expected = computePopularityScore({
        wikiViews: viewsById.get(t.id) ?? 0,
        maxWikiViews,
        tags: t.tags,
        featured: t.featured,
        rating: t.rating,
      });
      expect(scoreById.get(t.id)).toBe(expected);
    }
  });
});
