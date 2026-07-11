import { describe, it, expect } from "vitest";
import { temples } from "@/data/temples";
import { INDIA_STATES } from "./india-geo";
import { REGION_ORDER, REGION_META, STATE_REGION, regionPigment, regionIconPath, regionForState } from "./regions";

describe("regionPigment / regionIconPath", () => {
  it("resolves a pigment and a non-empty icon path for every region", () => {
    for (const region of REGION_ORDER) {
      expect(regionPigment(region)).toBe(REGION_META[region].pigment);
      expect(regionIconPath(region)).toMatch(/\S/);
    }
  });
});

describe("STATE_REGION", () => {
  it("has exactly one entry per state/UT in the generated map geometry (36)", () => {
    const geoNames = INDIA_STATES.map((s) => s.name).sort();
    const mappedNames = Object.keys(STATE_REGION).sort();
    expect(mappedNames).toEqual(geoNames);
  });

  it("agrees with every real temple record's own region field", () => {
    for (const t of temples) {
      expect(regionForState(t.state), `${t.name}'s state "${t.state}"`).toBe(t.region);
    }
  });

  it("returns undefined for an unknown state name", () => {
    expect(regionForState("Not A Real State")).toBeUndefined();
  });
});
