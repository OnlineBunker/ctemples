import { describe, it, expect } from "vitest";
import { temples } from "@/data/temples";
import { validateTemples } from "./validate";

/** Guards the hand-authored (and later, generated) content against the schema. */
describe("placeholder dataset", () => {
  it("passes shape validation with zero issues", () => {
    const report = validateTemples(temples);
    expect(report.issues).toEqual({});
    expect(report.duplicateIds).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("has at least one featured temple for the home showcase", () => {
    expect(temples.some((t) => t.featured)).toBe(true);
  });

  it("gives every temple 3–4 cost estimates from distinct hub cities", () => {
    for (const t of temples) {
      expect(t.costEstimates.length).toBeGreaterThanOrEqual(3);
      expect(t.costEstimates.length).toBeLessThanOrEqual(4);
      const cities = new Set(t.costEstimates.map((c) => c.fromCity));
      expect(cities.size).toBe(t.costEstimates.length);
    }
  });

  it("writes long-form history as paragraph-separated prose", () => {
    for (const t of temples) {
      expect(t.history).toContain("\n\n");
    }
  });
});
