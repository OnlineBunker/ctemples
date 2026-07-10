import { describe, it, expect } from "vitest";
import { temples } from "@/data/temples";
import { searchTemples } from "./search";

/**
 * The golden-query suite (docs/10 §8) — the behavioral lock for the search ranking.
 * Every assertion below was verified against the real 15-record dataset before being
 * written (not copied blind from the doc's illustrative list). This suite is the
 * acceptance test for any future engine swap (docs/10 §7) — it must pass unchanged.
 */
describe("golden queries", () => {
  it('"mahadev" fires the alias and surfaces Shiva temples', () => {
    const { results, matchedAliases } = searchTemples(temples, "mahadev");
    expect(matchedAliases).toEqual(["mahadev"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results.map((t) => t.id).slice(0, 4)).toEqual(
      expect.arrayContaining(["brihadeeswarar-temple", "kedarnath-temple", "kashi-vishwanath-temple"]),
    );
  });

  it('"balaji" pins Tirumala Venkateswara first', () => {
    const { results } = searchTemples(temples, "balaji");
    expect(results[0]?.id).toBe("tirumala-venkateswara-temple");
  });

  it('"jagannath" pins the Puri temple first', () => {
    const { results } = searchTemples(temples, "jagannath");
    expect(results[0]?.id).toBe("jagannath-temple-puri");
  });

  it('"madurai" pins Meenakshi Amman first', () => {
    const { results } = searchTemples(temples, "madurai");
    expect(results[0]?.id).toBe("meenakshi-amman-temple");
  });

  it('"varanasi" pins Kashi Vishwanath first', () => {
    const { results } = searchTemples(temples, "varanasi");
    expect(results[0]?.id).toBe("kashi-vishwanath-temple");
  });

  it('"golden temple" pins the Amritsar temple first', () => {
    const { results } = searchTemples(temples, "golden temple");
    expect(results[0]?.id).toBe("golden-temple");
  });

  it('"jyotirlinga" surfaces the Jyotirlinga temples', () => {
    const { results } = searchTemples(temples, "jyotirlinga");
    const top = results.slice(0, 4).map((t) => t.id);
    expect(top).toEqual(
      expect.arrayContaining([
        "kedarnath-temple",
        "kashi-vishwanath-temple",
        "ramanathaswamy-temple",
        "somnath-temple",
      ]),
    );
  });

  it('"unesco" surfaces exactly the 3 UNESCO-tagged temples (tag-contains match, no alias needed)', () => {
    const { results } = searchTemples(temples, "unesco");
    expect(results.map((t) => t.id).sort()).toEqual(
      ["brihadeeswarar-temple", "konark-sun-temple", "virupaksha-temple-hampi"].sort(),
    );
  });

  it.skip('"meenakshee" (typo) — exempt until Meilisearch ships typo tolerance (docs/10 §8)', () => {
    const { results } = searchTemples(temples, "meenakshee");
    expect(results[0]?.id).toBe("meenakshi-amman-temple");
  });

  it('"tamil nadu" surfaces only Tamil Nadu temples', () => {
    const { results } = searchTemples(temples, "tamil nadu");
    expect(results.length).toBeGreaterThan(0);
    for (const t of results) expect(t.state).toBe("Tamil Nadu");
  });

  it('"sun temple" pins Konark first', () => {
    const { results } = searchTemples(temples, "sun temple");
    expect(results[0]?.id).toBe("konark-sun-temple");
  });

  it('"shiva" surfaces the Shiva set, rating-ordered', () => {
    const { results } = searchTemples(temples, "shiva");
    const ratings = results.map((t) => t.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
    expect(results.map((t) => t.id)).toContain("kedarnath-temple");
  });

  it('"himalayan" includes Kedarnath', () => {
    const { results } = searchTemples(temples, "himalayan");
    expect(results.map((t) => t.id)).toContain("kedarnath-temple");
  });

  it('"kanchipuram" returns no results today (no place-alias yet, no matching temple — docs/10 §4/§8)', () => {
    const { results } = searchTemples(temples, "kanchipuram");
    expect(results).toEqual([]);
  });

  it("empty query returns everything sorted by rating", () => {
    const { results } = searchTemples(temples, "");
    const ratings = results.map((t) => t.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
    expect(results).toHaveLength(temples.length);
  });
});
