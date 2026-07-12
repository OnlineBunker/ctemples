import { describe, it, expect } from "vitest";
import { buildTempleTitle, buildTempleDescription } from "./seo";

describe("buildTempleTitle", () => {
  it("uses the full name+city template when it fits within 60 chars", () => {
    const title = buildTempleTitle("Golden Temple", "Amritsar");
    expect(title).toBe("Golden Temple, Amritsar — history, timings & how to visit");
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it("drops the city first when the full title exceeds 60 chars", () => {
    const title = buildTempleTitle("Ramanathaswamy Temple", "Rameswaram");
    expect(title).not.toContain("Rameswaram");
    expect(title).toBe("Ramanathaswamy Temple — history, timings & how to visit");
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it("truncates the tail with an ellipsis when even the name-only form is too long", () => {
    const title = buildTempleTitle("A Very Long Temple Name That Goes On And On And On", "City");
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith("…")).toBe(true);
  });
});

describe("buildTempleDescription", () => {
  it("prefers whyVisit, capped at 155 chars", () => {
    const whyVisit = "x".repeat(200);
    const desc = buildTempleDescription({ whyVisit, tagline: "tagline", overview: "overview" });
    expect(desc).toBe("x".repeat(155));
  });

  it("falls back to tagline when whyVisit is blank", () => {
    const desc = buildTempleDescription({ whyVisit: "  ", tagline: "A short tagline.", overview: "overview" });
    expect(desc).toBe("A short tagline.");
  });

  it("falls back to overview when both whyVisit and tagline are absent", () => {
    const desc = buildTempleDescription({ overview: "The overview text." });
    expect(desc).toBe("The overview text.");
  });
});
