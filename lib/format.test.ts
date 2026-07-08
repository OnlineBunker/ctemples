import { describe, it, expect } from "vitest";
import {
  formatRupees,
  parseRupeeRange,
  cheapestBudget,
  formatDistance,
  formatRating,
  formatCoordinates,
  pluralize,
} from "./format";
import type { CostEstimate } from "./types";

describe("formatRupees", () => {
  it("uses Indian digit grouping (lakh/crore)", () => {
    expect(formatRupees(400000)).toBe("₹4,00,000");
    expect(formatRupees(1500)).toBe("₹1,500");
    expect(formatRupees(12500000)).toBe("₹1,25,00,000");
  });
  it("rounds and floors at zero", () => {
    expect(formatRupees(4999.6)).toBe("₹5,000");
    expect(formatRupees(-50)).toBe("₹0");
  });
});

describe("parseRupeeRange", () => {
  it("parses a two-ended range", () => {
    expect(parseRupeeRange("₹4,000 - ₹6,000 per person")).toEqual({ min: 4000, max: 6000 });
  });
  it("treats a trailing + as open-ended (max null)", () => {
    expect(parseRupeeRange("₹15,000+ per person")).toEqual({ min: 15000, max: null });
  });
  it("handles a single fixed value", () => {
    expect(parseRupeeRange("₹2,500 per person")).toEqual({ min: 2500, max: 2500 });
  });
  it("is resilient to junk input", () => {
    expect(parseRupeeRange("free")).toEqual({ min: 0, max: null });
  });
});

describe("cheapestBudget", () => {
  const estimates: CostEstimate[] = [
    { fromCity: "A", distanceKm: 1, travelTime: "", budget: "₹6,000 - ₹8,000 per person", midRange: "", luxury: "" },
    { fromCity: "B", distanceKm: 2, travelTime: "", budget: "₹3,500 - ₹5,000 per person", midRange: "", luxury: "" },
  ];
  it("returns the lowest starting budget across estimates", () => {
    expect(cheapestBudget(estimates)).toBe(3500);
  });
  it("returns null when there are no estimates", () => {
    expect(cheapestBudget([])).toBeNull();
  });
});

describe("formatDistance / formatRating", () => {
  it("formats distance with unit", () => {
    expect(formatDistance(412)).toBe("412 km");
    expect(formatDistance(2200)).toBe("2,200 km");
  });
  it("formats rating to one decimal", () => {
    expect(formatRating(4.8)).toBe("4.8");
    expect(formatRating(5)).toBe("5.0");
  });
});

describe("formatCoordinates", () => {
  it("renders a cartographic label with hemispheres", () => {
    expect(formatCoordinates({ lat: 12.97, lng: 79.13 })).toBe("12.9700° N, 79.1300° E");
    expect(formatCoordinates({ lat: -8.5, lng: -70.2 })).toBe("8.5000° S, 70.2000° W");
  });
});

describe("pluralize", () => {
  it("singular vs plural", () => {
    expect(pluralize(1, "festival")).toBe("1 festival");
    expect(pluralize(3, "festival")).toBe("3 festivals");
    expect(pluralize(2, "deity", "deities")).toBe("2 deities");
  });
});
