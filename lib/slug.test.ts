import { describe, it, expect } from "vitest";
import { temples } from "@/data/temples";
import slugRegistry from "@/data/slug-registry.json";
import { geohash, mintSlug, getOrMintSlug, type SlugRegistryEntry } from "./slug";

const KEDARNATH = { lat: 30.7346, lng: 79.0669 };
const SOMEWHERE_ELSE = { lat: 0, lng: 0 };

describe("geohash", () => {
  it("is deterministic for the same coordinates", () => {
    expect(geohash(KEDARNATH.lat, KEDARNATH.lng)).toBe(geohash(KEDARNATH.lat, KEDARNATH.lng));
  });

  it("defaults to 5 characters", () => {
    expect(geohash(KEDARNATH.lat, KEDARNATH.lng)).toHaveLength(5);
  });

  it("differs for meaningfully different coordinates", () => {
    expect(geohash(KEDARNATH.lat, KEDARNATH.lng)).not.toBe(geohash(8.5, 77.0));
  });
});

describe("mintSlug", () => {
  const empty: SlugRegistryEntry[] = [];
  const input = {
    name: "Somnath Temple",
    city: "Prabhas Patan (Veraval)",
    state: "Gujarat",
    coordinates: { lat: 20.888, lng: 70.4013 },
  };

  it("mints the bare name slug when nothing collides", () => {
    expect(mintSlug(input, empty)).toBe("somnath-temple");
  });

  it("falls back to +city on a name collision", () => {
    const registry: SlugRegistryEntry[] = [
      { slug: "somnath-temple", name: "A different Somnath shrine", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
    ];
    expect(mintSlug(input, registry)).toBe("somnath-temple-prabhas-patan-veraval");
  });

  it("falls back to +state on a name+city collision", () => {
    const registry: SlugRegistryEntry[] = [
      { slug: "somnath-temple", name: "A", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
      { slug: "somnath-temple-prabhas-patan-veraval", name: "B", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
    ];
    expect(mintSlug(input, registry)).toBe("somnath-temple-prabhas-patan-veraval-gujarat");
  });

  it("falls back to +geohash5 on a name+city+state collision", () => {
    const registry: SlugRegistryEntry[] = [
      { slug: "somnath-temple", name: "A", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
      { slug: "somnath-temple-prabhas-patan-veraval", name: "B", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
      { slug: "somnath-temple-prabhas-patan-veraval-gujarat", name: "C", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
    ];
    const slug = mintSlug(input, registry);
    expect(slug).toBe(`somnath-temple-prabhas-patan-veraval-gujarat-g${geohash(input.coordinates.lat, input.coordinates.lng, 5)}`);
  });

  it("never renames an existing slug just because it was minted first ('first-come keeps the short slug')", () => {
    const registry: SlugRegistryEntry[] = [
      { slug: "somnath-temple", name: "A different Somnath shrine", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
    ];
    // The already-registered "somnath-temple" keeps its short slug; only the new,
    // colliding record gets pushed to a longer one.
    expect(registry[0].slug).toBe("somnath-temple");
    expect(mintSlug(input, registry)).not.toBe("somnath-temple");
  });

  it("throws when even the +geohash5 tier collides — no fake distinguisher is invented", () => {
    const clash = `somnath-temple-prabhas-patan-veraval-gujarat-g${geohash(input.coordinates.lat, input.coordinates.lng, 5)}`;
    const registry: SlugRegistryEntry[] = [
      { slug: "somnath-temple", name: "A", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
      { slug: "somnath-temple-prabhas-patan-veraval", name: "B", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
      { slug: "somnath-temple-prabhas-patan-veraval-gujarat", name: "C", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
      { slug: clash, name: "D", city: "X", state: "Y", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-01-01" },
    ];
    expect(() => mintSlug(input, registry)).toThrow(/exhausted/i);
  });
});

describe("getOrMintSlug", () => {
  const input = {
    name: "Kedarnath Temple",
    city: "Kedarnath",
    state: "Uttarakhand",
    coordinates: KEDARNATH,
  };

  it("mints a new slug for a record not yet in the registry", () => {
    expect(getOrMintSlug(input, [])).toBe("kedarnath-temple");
  });

  it("is idempotent — re-running against a registry that already has this exact record returns its frozen slug unchanged", () => {
    const registry: SlugRegistryEntry[] = [
      { slug: "kedarnath-temple", name: input.name, city: input.city, state: input.state, coordinates: KEDARNATH, mintedAt: "2026-07-08" },
    ];
    expect(getOrMintSlug(input, registry)).toBe("kedarnath-temple");
    // Even with an unrelated record also present, the exact-match lookup wins over minting.
    const busier = [
      ...registry,
      { slug: "some-other-temple", name: "Other", city: "Elsewhere", state: "Bihar", coordinates: SOMEWHERE_ELSE, mintedAt: "2026-07-08" },
    ];
    expect(getOrMintSlug(input, busier)).toBe("kedarnath-temple");
  });

  it("does NOT collapse two distinct temples that merely share name+city+state — coordinates must also match", () => {
    // The regression this test guards: a generic name ("Shiva Temple") recurring in the
    // same city+state, but at a different site entirely, must NOT inherit the first
    // record's slug — it has to run mintSlug's own disambiguation cascade.
    const registry: SlugRegistryEntry[] = [
      { slug: "shiva-temple", name: "Shiva Temple", city: "Varanasi", state: "Uttar Pradesh", coordinates: { lat: 25.31, lng: 83.01 }, mintedAt: "2026-01-01" },
    ];
    const distinctTemple = {
      name: "Shiva Temple",
      city: "Varanasi",
      state: "Uttar Pradesh",
      coordinates: { lat: 25.28, lng: 82.95 }, // several km away — a different shrine
    };
    const resolved = getOrMintSlug(distinctTemple, registry);
    expect(resolved).not.toBe("shiva-temple");
    expect(resolved).toBe("shiva-temple-varanasi");
  });

  it("does treat near-identical coordinates (survey noise) as the same record", () => {
    const registry: SlugRegistryEntry[] = [
      { slug: "kedarnath-temple", name: input.name, city: input.city, state: input.state, coordinates: KEDARNATH, mintedAt: "2026-07-08" },
    ];
    const slightlyOffCoordinates = { ...input, coordinates: { lat: KEDARNATH.lat + 0.001, lng: KEDARNATH.lng } };
    expect(getOrMintSlug(slightlyOffCoordinates, registry)).toBe("kedarnath-temple");
  });
});

describe("data/slug-registry.json", () => {
  it("has one entry per current temple, and every id resolves via getOrMintSlug unchanged", () => {
    const registry = slugRegistry as SlugRegistryEntry[];
    expect(registry).toHaveLength(temples.length);
    for (const t of temples) {
      const resolved = getOrMintSlug(
        { name: t.name, city: t.city, state: t.state, coordinates: t.coordinates },
        registry,
      );
      expect(resolved).toBe(t.id);
    }
  });
});
