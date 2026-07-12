import { describe, it, expect } from "vitest";
import { computeRelatedSections, visibleSections, reachModes, isSectionVisible } from "./detail-sections";
import { makeTemple } from "./__fixtures__/temple";

describe("reachModes", () => {
  it("returns all three modes when all are populated", () => {
    const t = makeTemple();
    expect(reachModes(t).map((m) => m.key)).toEqual(["air", "train", "road"]);
  });
  it("omits a mode with empty/whitespace text", () => {
    const t = makeTemple({ howToReach: { byAir: "", byTrain: "  ", byRoad: "By road." } });
    expect(reachModes(t).map((m) => m.key)).toEqual(["road"]);
  });
});

describe("computeRelatedSections", () => {
  // Near the equator, 1 degree of longitude is ~111.2 km.
  const origin = makeTemple({ id: "origin", region: "South", deity: "Shiva", architecturalStyleSlug: "dravidian", coordinates: { lat: 0, lng: 0 } });
  const near = makeTemple({ id: "near", region: "South", deity: "Vishnu", architecturalStyleSlug: "kalinga", coordinates: { lat: 0, lng: 0.5 } }); // ~55.6km
  const sameDeity = makeTemple({ id: "same-deity", region: "East", deity: "Shiva", architecturalStyleSlug: "kalinga", coordinates: { lat: 10, lng: 10 }, rating: 4.8 });
  const sameStyle = makeTemple({ id: "same-style", region: "East", deity: "Vishnu", architecturalStyleSlug: "dravidian", coordinates: { lat: 20, lng: 20 }, rating: 4.6 });
  const farOther = makeTemple({ id: "far-other", region: "North", deity: "Ganesha", architecturalStyleSlug: "nagara", coordinates: { lat: 30, lng: 30 } });

  it("finds real ≤100km matches and does not fall back", () => {
    const related = computeRelatedSections(origin, [origin, near, sameDeity, sameStyle, farOther]);
    expect(related.within100km.map((r) => r.temple.id)).toEqual(["near"]);
    expect(related.remoteFallback).toEqual([]);
  });

  it("dedupes sameDeity/sameStyle against whatever within100km already showed", () => {
    // "near" shares no deity/style with origin, so it wouldn't double-count here anyway —
    // use a temple that's both nearby AND shares the deity to prove the dedup fires.
    const nearAndSameDeity = makeTemple({ id: "near-same-deity", region: "South", deity: "Shiva", architecturalStyleSlug: "kalinga", coordinates: { lat: 0, lng: 0.5 } });
    const related = computeRelatedSections(origin, [origin, nearAndSameDeity, sameStyle]);
    expect(related.within100km.map((r) => r.temple.id)).toEqual(["near-same-deity"]);
    // Would otherwise match origin's deity (Shiva) — must be excluded, already shown.
    expect(related.sameDeity.map((t) => t.id)).not.toContain("near-same-deity");
  });

  it("falls back to same-region top-rated when nothing is within 100km", () => {
    const related = computeRelatedSections(origin, [origin, sameDeity, sameStyle, farOther]);
    expect(related.within100km).toEqual([]);
    // origin's region is South; none of the others are South, so the fallback is empty too.
    expect(related.remoteFallback).toEqual([]);
  });

  it("same-region fallback actually returns same-region temples when they exist", () => {
    const sameRegionFar = makeTemple({ id: "same-region-far", region: "South", deity: "Ganesha", coordinates: { lat: 40, lng: 40 }, rating: 4.9 });
    const related = computeRelatedSections(origin, [origin, sameRegionFar, farOther]);
    expect(related.within100km).toEqual([]);
    expect(related.remoteFallback.map((t) => t.id)).toEqual(["same-region-far"]);
  });

  it("excludes self from sameDeity and sameStyle", () => {
    const related = computeRelatedSections(origin, [origin]);
    expect(related.sameDeity).toEqual([]);
    expect(related.sameStyle).toEqual([]);
  });
});

describe("visibleSections", () => {
  const emptyRelated = { within100km: [], remoteFallback: [], sameDeity: [], sameStyle: [] };

  it("includes overview and map unconditionally (always-present floor)", () => {
    const t = makeTemple();
    const sections = visibleSections(t, emptyRelated);
    expect(isSectionVisible(sections, "overview")).toBe(true);
    expect(isSectionVisible(sections, "map")).toBe(true);
  });

  it("hides plan-around when tripDuration is absent, and renumbers the rest", () => {
    const t = makeTemple({ tripDuration: undefined });
    const sections = visibleSections(t, emptyRelated);
    expect(isSectionVisible(sections, "plan-around")).toBe(false);
    // "why-visit" (present by fixture default) should be index 1; "best-time" follows at 2
    // (not 3), since plan-around's slot is skipped entirely, not left blank.
    const whyVisit = sections.find((s) => s.id === "why-visit")!;
    const bestTime = sections.find((s) => s.id === "best-time")!;
    expect(whyVisit.index).toBe(1);
    expect(bestTime.index).toBe(whyVisit.index + 1);
  });

  it("shows plan-around when tripDuration is present", () => {
    const t = makeTemple({ tripDuration: { temples: 3, days: 4, km: 120 } });
    const sections = visibleSections(t, emptyRelated);
    expect(isSectionVisible(sections, "plan-around")).toBe(true);
  });

  it("hides gallery when fewer than 2 non-hero images exist", () => {
    const t = makeTemple({ media: [{ kind: "image", url: "a", alt: "a" }] });
    expect(isSectionVisible(visibleSections(t, emptyRelated), "gallery")).toBe(false);
  });

  it("shows gallery when ≥2 non-hero images exist", () => {
    const t = makeTemple({
      media: [
        { kind: "image", url: "a", alt: "a" },
        { kind: "image", url: "b", alt: "b" },
        { kind: "image", url: "c", alt: "c" },
      ],
    });
    expect(isSectionVisible(visibleSections(t, emptyRelated), "gallery")).toBe(true);
  });

  it("hides history/legends/architecture/spiritual-significance when blank", () => {
    const t = makeTemple({ history: "  ", legendsAndMythology: "", architecture: "Real content.", spiritualSignificance: "Real content." });
    const sections = visibleSections(t, emptyRelated);
    expect(isSectionVisible(sections, "history")).toBe(false);
    expect(isSectionVisible(sections, "legends")).toBe(false);
    expect(isSectionVisible(sections, "architecture")).toBe(true);
    expect(isSectionVisible(sections, "spiritual-significance")).toBe(true);
  });

  it("hides how-to-reach when every mode is blank", () => {
    const t = makeTemple({ howToReach: { byAir: "", byTrain: "", byRoad: "" } });
    expect(isSectionVisible(visibleSections(t, emptyRelated), "how-to-reach")).toBe(false);
  });

  it("hides same-style when architecturalStyleSlug is absent even if the related list is non-empty", () => {
    const t = makeTemple({ architecturalStyleSlug: "" });
    const relatedWithMatches = { ...emptyRelated, sameStyle: [makeTemple({ id: "other" })] };
    expect(isSectionVisible(visibleSections(t, relatedWithMatches), "same-style")).toBe(false);
  });

  it("shows within-100km when only the remote fallback has entries", () => {
    const related = { ...emptyRelated, remoteFallback: [makeTemple({ id: "far" })] };
    expect(isSectionVisible(visibleSections(makeTemple(), related), "within-100km")).toBe(true);
  });

  it("hides within-100km when both the real list and the fallback are empty", () => {
    expect(isSectionVisible(visibleSections(makeTemple(), emptyRelated), "within-100km")).toBe(false);
  });

  it("renumbers sequentially with no gaps regardless of which sections are hidden", () => {
    const t = makeTemple({ tripDuration: undefined, history: "", legendsAndMythology: "" });
    const sections = visibleSections(t, emptyRelated);
    const indices = sections.map((s) => s.index);
    expect(indices).toEqual(Array.from({ length: indices.length }, (_, i) => i + 1));
  });
});
