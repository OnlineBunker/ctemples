import { describe, it, expect } from "vitest";
import { temples } from "@/data/temples";
import { TAG_REGISTRY, isRegisteredTag, getTagEntry, getTagEntryBySlug } from "@/data/tag-registry";

describe("TAG_REGISTRY", () => {
  it("has no duplicate tags or slugs", () => {
    const tags = TAG_REGISTRY.map((e) => e.tag);
    const slugs = TAG_REGISTRY.map((e) => e.slug);
    expect(new Set(tags).size).toBe(tags.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("covers every tag actually used in data/temples.ts", () => {
    const used = new Set(temples.flatMap((t) => t.tags));
    const missing = [...used].filter((tag) => !isRegisteredTag(tag));
    expect(missing).toEqual([]);
  });

  it("resolves a known tag by name and by slug", () => {
    expect(getTagEntry("Jyotirlinga")?.kind).toBe("circuit");
    expect(getTagEntryBySlug("jyotirlinga")?.tag).toBe("Jyotirlinga");
  });

  it("rejects an unregistered tag", () => {
    expect(isRegisteredTag("Not A Real Tag")).toBe(false);
  });

  it("gives the highest prominence to UNESCO World Heritage", () => {
    expect(getTagEntry("UNESCO World Heritage")?.prominence).toBe(1.0);
  });
});
