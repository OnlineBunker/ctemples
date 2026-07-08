import { describe, it, expect } from "vitest";
import { haversineKm } from "./distance";

describe("haversineKm", () => {
  it("returns 0 for identical points", () => {
    expect(haversineKm({ lat: 12.97, lng: 79.13 }, { lat: 12.97, lng: 79.13 })).toBe(0);
  });

  it("matches the known 1-degree-of-longitude-at-the-equator distance (~111.2 km)", () => {
    const km = haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    expect(km).toBeCloseTo((Math.PI / 180) * 6371, 1);
  });

  it("matches a quarter of Earth's circumference for a 90-degree arc", () => {
    const km = haversineKm({ lat: 0, lng: 0 }, { lat: 90, lng: 0 });
    expect(km).toBeCloseTo((Math.PI / 2) * 6371, 1);
  });

  it("is symmetric", () => {
    const a = { lat: 13.6288, lng: 79.4192 };
    const b = { lat: 9.9195, lng: 78.1193 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6);
  });
});
