import { describe, it, expect } from "vitest";
import { REGION_ORDER, REGION_META, regionPigment, regionIconPath } from "./regions";

describe("regionPigment / regionIconPath", () => {
  it("resolves a pigment and a non-empty icon path for every region", () => {
    for (const region of REGION_ORDER) {
      expect(regionPigment(region)).toBe(REGION_META[region].pigment);
      expect(regionIconPath(region)).toMatch(/\S/);
    }
  });
});
