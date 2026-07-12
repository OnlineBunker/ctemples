import { describe, it, expect } from "vitest";
import { temples } from "@/data/temples";
import slugRegistry from "@/data/slug-registry.json";
import { isRegisteredTag } from "@/data/tag-registry";
import { SEARCH_ALIASES, matchAliases, resolveAliasLabel, resolveTargetLabel } from "./search-aliases";
import { DEITY_ORDER, DEITY_META, type DeityKey } from "./deities";
import { slugify } from "./utils";

/**
 * CI target-resolution gate (docs/10 §4 governance): "aliases are data … every entry
 * carries note; CI resolves every target (deity key exists, slug in registry, city/state
 * in dataset, tag in registry) — a typo'd alias cannot ship." This suite IS that gate.
 */

const templeSlugs = new Set(slugRegistry.map((e) => e.slug));
const cities = new Set(temples.map((t) => t.city.toLowerCase()));
const stateSlugs = new Set(temples.map((t) => slugify(t.state)));

describe("SEARCH_ALIASES — CI target resolution", () => {
  it("has at least 8 entries", () => {
    expect(SEARCH_ALIASES.length).toBeGreaterThanOrEqual(8);
  });

  it("has no duplicate alias keys", () => {
    const keys = SEARCH_ALIASES.map((a) => a.alias);
    expect(new Set(keys).size).toBe(keys.length);
  });

  for (const alias of SEARCH_ALIASES) {
    describe(`"${alias.alias}"`, () => {
      it("carries a non-empty note", () => {
        expect(alias.note.trim().length).toBeGreaterThan(0);
      });

      it("has at least one target", () => {
        expect(alias.targets.length).toBeGreaterThan(0);
      });

      for (const [i, target] of alias.targets.entries()) {
        it(`target ${i} (${target.type}) resolves`, () => {
          switch (target.type) {
            case "deity":
              expect(DEITY_ORDER).toContain(target.key);
              break;
            case "temple":
              expect(templeSlugs.has(target.slug)).toBe(true);
              break;
            case "place":
              expect(!!target.city || !!target.stateSlug).toBe(true);
              if (target.city) expect(cities.has(target.city.toLowerCase())).toBe(true);
              if (target.stateSlug) expect(stateSlugs.has(target.stateSlug)).toBe(true);
              break;
            case "tag":
              expect(isRegisteredTag(target.tag)).toBe(true);
              break;
          }
        });
      }
    });
  }
});

describe("matchAliases — per-token matching (docs/10 §4/§9)", () => {
  it("fires a bare alias query", () => {
    expect(matchAliases("mahadev").map((a) => a.alias)).toEqual(["mahadev"]);
  });

  it("fires an alias embedded inside a longer query (fixes the whole-query-only limitation)", () => {
    expect(matchAliases("mahadev temple ujjain").map((a) => a.alias)).toContain("mahadev");
  });

  it("does not fire on a substring that isn't a whole word", () => {
    const fired = matchAliases("mahadeva").map((a) => a.alias);
    expect(fired).toContain("mahadeva");
    expect(fired).not.toContain("mahadev");
  });

  it("can fire more than one alias in the same query", () => {
    const fired = matchAliases("balaji and jagannath").map((a) => a.alias);
    expect(fired).toEqual(expect.arrayContaining(["balaji", "jagannath"]));
  });

  it("returns nothing for an empty query", () => {
    expect(matchAliases("")).toEqual([]);
  });

  it("is case-insensitive", () => {
    expect(matchAliases("MAHADEV").map((a) => a.alias)).toEqual(["mahadev"]);
  });
});

const deityLabel = (key: DeityKey) => DEITY_META[key].label;

describe("resolveAliasLabel — smart-match banner label resolution (docs/10 §4)", () => {
  it("resolves a deity target to its display label", () => {
    expect(resolveAliasLabel("mahadev", temples, deityLabel)).toBe("Shiva");
  });

  it("resolves a composable alias via its FIRST target only, per docs/10 §4's own 'balaji' ordering ([deity, temple])", () => {
    // "balaji"'s deity target is listed first in lib/search-aliases.ts, matching docs/10
    // §4's own worked example ordering — the banner shows "Vishnu", not the temple name,
    // even though the temple (second) target is what pins Tirumala in ranking.
    expect(resolveAliasLabel("balaji", temples, deityLabel)).toBe("Vishnu");
  });

  it("resolves a composable alias via its FIRST target only, per docs/10 §4's own 'jagannath' ordering ([deity, place])", () => {
    expect(resolveAliasLabel("jagannath", temples, deityLabel)).toBe("Vishnu");
  });

  it("falls back to the alias key itself when the alias isn't found", () => {
    expect(resolveAliasLabel("not-a-real-alias", temples, deityLabel)).toBe("not-a-real-alias");
  });
});

describe("resolveTargetLabel — per-target-type resolution, including branches no shipped alias exercises yet", () => {
  it("resolves a deity target", () => {
    expect(resolveTargetLabel({ type: "deity", key: "shiva" }, temples, deityLabel, "fallback")).toBe("Shiva");
  });

  it("resolves a temple target to the real temple name", () => {
    expect(
      resolveTargetLabel({ type: "temple", slug: "kedarnath-temple" }, temples, deityLabel, "fallback"),
    ).toBe("Kedarnath Temple");
  });

  it("falls back when a temple target's slug doesn't match any temple", () => {
    expect(
      resolveTargetLabel({ type: "temple", slug: "no-such-temple" }, temples, deityLabel, "fallback"),
    ).toBe("fallback");
  });

  it("resolves a place target's city directly", () => {
    expect(resolveTargetLabel({ type: "place", city: "Puri" }, temples, deityLabel, "fallback")).toBe("Puri");
  });

  it("resolves a place target with only a stateSlug to the MATCHING temple's real state, not just the first temple in the array", () => {
    const odishaSlug = slugify(temples.find((t) => t.state === "Odisha")!.state);
    expect(resolveTargetLabel({ type: "place", stateSlug: odishaSlug }, temples, deityLabel, "fallback")).toBe(
      "Odisha",
    );
    // The first temple in data/temples.ts is Meenakshi Amman (Tamil Nadu) — before the
    // fix, the predicate only checked truthiness and returned this regardless of match.
    expect(temples[0].state).not.toBe("Odisha");
  });

  it("falls back when a place target's stateSlug matches no temple", () => {
    expect(
      resolveTargetLabel({ type: "place", stateSlug: "nowhere" }, temples, deityLabel, "fallback"),
    ).toBe("fallback");
  });

  it("resolves a tag target to the tag string as stored", () => {
    expect(resolveTargetLabel({ type: "tag", tag: "Jyotirlinga" }, temples, deityLabel, "fallback")).toBe(
      "Jyotirlinga",
    );
  });
});
