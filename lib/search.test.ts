import { describe, it, expect } from "vitest";
import { searchTemples } from "./search";
import { SEARCH_ALIASES } from "./search-aliases";
import { makeTemple } from "./__fixtures__/temple";

const kashi = makeTemple({
  id: "kashi",
  name: "Kashi Vishwanath Temple",
  city: "Varanasi",
  state: "Uttar Pradesh",
  deity: "Vishwanath / Vishweshwara (Shiva), one of the twelve Jyotirlingas",
  tags: ["Jyotirlinga", "Ganga"],
  overview: "A vast temple beside the sacred river.",
  history: "Ancient origins, rebuilt many times.",
  rating: 4.9,
});
const tirumala = makeTemple({
  id: "tirumala",
  name: "Tirumala Venkateswara Temple",
  city: "Tirumala",
  state: "Andhra Pradesh",
  deity: "Venkateswara / Balaji (a form of Vishnu)",
  tags: ["Pilgrimage", "TTD"],
  overview: "The most-visited pilgrimage site on Earth.",
  history: "A hilltop shrine of great antiquity.",
  rating: 4.9,
});
const konark = makeTemple({
  id: "konark",
  name: "Konark Sun Temple",
  city: "Konark",
  state: "Odisha",
  deity: "Surya (the Sun God)",
  tags: ["UNESCO World Heritage", "Kalinga"],
  overview: "A temple conceived as a colossal stone chariot.",
  history: "Built under the Eastern Ganga dynasty.",
  rating: 4.6,
});

const all = [kashi, tirumala, konark];

describe("searchTemples", () => {
  it("empty query returns everything sorted by rating", () => {
    const { results, matchedAliases } = searchTemples(all, "");
    expect(results.map((t) => t.id)).toEqual(["kashi", "tirumala", "konark"]);
    expect(matchedAliases).toEqual([]);
  });

  it("matches a canonical deity key directly (no alias needed)", () => {
    const { results } = searchTemples(all, "shiva");
    expect(results.map((t) => t.id)).toEqual(["kashi"]);
  });

  it("resolves an alias to its canonical deity and reports the match", () => {
    // "balaji" is not literally in tirumala's deity string's start, but the alias
    // resolves it to "vishnu", which matchesDeity recognizes via the free-text prose.
    const { results, matchedAliases } = searchTemples(all, "balaji");
    expect(results.map((t) => t.id)).toContain("tirumala");
    expect(matchedAliases).toEqual(["balaji"]);
  });

  it("matches by name prefix", () => {
    const { results } = searchTemples(all, "konark");
    expect(results.map((t) => t.id)).toEqual(["konark"]);
  });

  it("matches by city or state", () => {
    expect(searchTemples(all, "varanasi").results.map((t) => t.id)).toEqual(["kashi"]);
    expect(searchTemples(all, "odisha").results.map((t) => t.id)).toEqual(["konark"]);
  });

  it("matches by tag", () => {
    expect(searchTemples(all, "unesco world heritage").results.map((t) => t.id)).toEqual(["konark"]);
  });

  it("matches by overview/history prose as a low-weight fallback", () => {
    const { results } = searchTemples(all, "chariot");
    expect(results.map((t) => t.id)).toEqual(["konark"]);
  });

  it("returns no results for a query that matches nothing", () => {
    expect(searchTemples(all, "antarctica").results).toEqual([]);
  });

  it("respects a result limit", () => {
    const { results } = searchTemples(all, "temple", { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(searchTemples(all, "  SHIVA  ").results.map((t) => t.id)).toEqual(["kashi"]);
  });
});

describe("SEARCH_ALIASES", () => {
  it("has at least 8 entries, each resolving to a canonical deity key", () => {
    const entries = Object.entries(SEARCH_ALIASES);
    expect(entries.length).toBeGreaterThanOrEqual(8);
    const validKeys = new Set(["shiva", "vishnu", "devi", "ganesha", "murugan", "hanuman"]);
    for (const [, canonical] of entries) {
      expect(validKeys.has(canonical)).toBe(true);
    }
  });
});
