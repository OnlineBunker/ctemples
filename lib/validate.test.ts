import { describe, it, expect } from "vitest";
import { validateTemple, validateTemples } from "./validate";
import { makeTemple } from "./__fixtures__/temple";

describe("validateTemple", () => {
  it("passes a well-formed temple", () => {
    expect(validateTemple(makeTemple())).toEqual([]);
  });

  it("flags a non-slug id", () => {
    const issues = validateTemple(makeTemple({ id: "Not A Slug!" }));
    expect(issues.some((i) => i.includes("slug"))).toBe(true);
  });

  it("flags an out-of-range rating", () => {
    expect(validateTemple(makeTemple({ rating: 9 })).some((i) => i.includes("rating"))).toBe(true);
  });

  it("flags coordinates outside India", () => {
    const issues = validateTemple(makeTemple({ coordinates: { lat: 48.8, lng: 2.3 } }));
    expect(issues.some((i) => i.includes("lat") || i.includes("lng"))).toBe(true);
  });

  it("requires 3–4 cost estimates", () => {
    const tooFew = makeTemple({ costEstimates: makeTemple().costEstimates.slice(0, 1) });
    expect(validateTemple(tooFew).some((i) => i.includes("cost estimates"))).toBe(true);
  });

  it("flags an invalid region", () => {
    // deliberately break the type to simulate bad generated data
    const bad = makeTemple({ region: "Middle" as never });
    expect(validateTemple(bad).some((i) => i.includes("region"))).toBe(true);
  });

  it("flags a whyVisit with fewer than 3 sentences", () => {
    const issues = validateTemple(makeTemple({ whyVisit: "Only one sentence." }));
    expect(issues.some((i) => i.includes("whyVisit"))).toBe(true);
  });

  it("flags a non-slug architecturalStyleSlug", () => {
    const issues = validateTemple(makeTemple({ architecturalStyleSlug: "Not A Slug!" }));
    expect(issues.some((i) => i.includes("architecturalStyleSlug"))).toBe(true);
  });

  it("flags an empty media array", () => {
    expect(validateTemple(makeTemple({ media: [] })).some((i) => i.includes("media"))).toBe(true);
  });

  it("flags a media item missing url or alt", () => {
    const issues = validateTemple(
      makeTemple({ media: [{ kind: "image", url: "", alt: "" } as never] }),
    );
    expect(issues.some((i) => i.includes("media[0].url"))).toBe(true);
    expect(issues.some((i) => i.includes("media[0].alt"))).toBe(true);
  });

  it("flags an invalid tripDuration", () => {
    const issues = validateTemple(makeTemple({ tripDuration: { temples: 0, days: 2, km: 100 } }));
    expect(issues.some((i) => i.includes("tripDuration"))).toBe(true);
  });

  it("accepts a temple with no tripDuration (it's optional)", () => {
    expect(validateTemple(makeTemple())).toEqual([]);
  });

  it("flags a tag that isn't in the controlled registry (data/tag-registry.ts)", () => {
    const issues = validateTemple(makeTemple({ tags: ["Dravidian", "Not A Real Tag"] }));
    expect(issues.some((i) => i.includes('tag "Not A Real Tag"'))).toBe(true);
  });
});

describe("validateTemples", () => {
  it("reports ok for a clean set", () => {
    const report = validateTemples([makeTemple({ id: "a" }), makeTemple({ id: "b" })]);
    expect(report.ok).toBe(true);
    expect(report.duplicateIds).toEqual([]);
  });

  it("detects duplicate ids", () => {
    const report = validateTemples([makeTemple({ id: "dup" }), makeTemple({ id: "dup" })]);
    expect(report.ok).toBe(false);
    expect(report.duplicateIds).toEqual(["dup"]);
  });

  it("collects per-temple issues keyed by id", () => {
    const report = validateTemples([makeTemple({ id: "good" }), makeTemple({ id: "bad", rating: 12 })]);
    expect(report.ok).toBe(false);
    expect(report.issues["bad"]).toBeDefined();
    expect(report.issues["good"]).toBeUndefined();
  });
});
