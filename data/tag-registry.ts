import { slugify } from "@/lib/utils";

export type TagKind = "heritage" | "deity-form" | "circuit" | "feature" | "experience";

export interface TagRegistryEntry {
  tag: string;
  slug: string;
  kind: TagKind;
  /**
   * Popularity prominence multiplier (docs/09 §4) — only the tiers the formula names
   * explicitly carry a value; everything else falls back to the featured/default rule
   * in scripts/compute-popularity.ts.
   */
  prominence?: number;
}

/**
 * The controlled tag vocabulary (docs/09 §6) — free-text tags are a validation error
 * (lib/validate.ts). Seeded from the 45 distinct tags already in data/temples.ts;
 * `slug` follows the same convention as countByTag() in lib/temple-queries.ts.
 */
export const TAG_REGISTRY: TagRegistryEntry[] = [
  { tag: "UNESCO World Heritage", slug: "unesco-world-heritage", kind: "heritage", prominence: 1.0 },
  { tag: "Jyotirlinga", slug: "jyotirlinga", kind: "circuit", prominence: 0.9 },
  { tag: "Char Dham", slug: "char-dham", kind: "circuit", prominence: 0.9 },
  { tag: "Shakti Pitha", slug: "shakti-pitha", kind: "circuit", prominence: 0.9 },
  { tag: "Panch Kedar", slug: "panch-kedar", kind: "circuit" },
  { tag: "Ambubachi Mela", slug: "ambubachi-mela", kind: "experience" },
  { tag: "BAPS", slug: "baps", kind: "heritage" },
  { tag: "Cave Shrine", slug: "cave-shrine", kind: "feature" },
  { tag: "Chalukya", slug: "chalukya", kind: "heritage" },
  { tag: "Chariot", slug: "chariot", kind: "feature" },
  { tag: "Chola", slug: "chola", kind: "heritage" },
  { tag: "Coastal", slug: "coastal", kind: "feature" },
  { tag: "Dravidian", slug: "dravidian", kind: "heritage" },
  { tag: "Ganesha", slug: "ganesha", kind: "deity-form" },
  { tag: "Ganga", slug: "ganga", kind: "deity-form" },
  { tag: "Gilded", slug: "gilded", kind: "feature" },
  { tag: "Gopuram", slug: "gopuram", kind: "feature" },
  { tag: "Heritage", slug: "heritage", kind: "heritage" },
  { tag: "Hilltop", slug: "hilltop", kind: "feature" },
  { tag: "Himalayan", slug: "himalayan", kind: "feature" },
  { tag: "Kalinga", slug: "kalinga", kind: "heritage" },
  { tag: "Living Temple", slug: "living-temple", kind: "experience" },
  { tag: "Major Pilgrimage", slug: "major-pilgrimage", kind: "experience" },
  { tag: "Modern Temple", slug: "modern-temple", kind: "feature" },
  { tag: "Navratri", slug: "navratri", kind: "experience" },
  { tag: "Pilgrimage", slug: "pilgrimage", kind: "experience" },
  { tag: "Ramayana", slug: "ramayana", kind: "heritage" },
  { tag: "Rath Yatra", slug: "rath-yatra", kind: "experience" },
  { tag: "Ruins", slug: "ruins", kind: "feature" },
  { tag: "Sculpture", slug: "sculpture", kind: "feature" },
  { tag: "Seasonal", slug: "seasonal", kind: "experience" },
  { tag: "Shakta", slug: "shakta", kind: "deity-form" },
  { tag: "Shakti", slug: "shakti", kind: "deity-form" },
  { tag: "Shiva", slug: "shiva", kind: "deity-form" },
  { tag: "Sikh", slug: "sikh", kind: "heritage" },
  { tag: "Sun Temple", slug: "sun-temple", kind: "feature" },
  { tag: "Surya", slug: "surya", kind: "deity-form" },
  { tag: "Swaminarayan", slug: "swaminarayan", kind: "heritage" },
  { tag: "TTD", slug: "ttd", kind: "heritage" },
  { tag: "Tantric", slug: "tantric", kind: "experience" },
  { tag: "Trekking", slug: "trekking", kind: "feature" },
  { tag: "Urban Temple", slug: "urban-temple", kind: "feature" },
  { tag: "Vaishnava", slug: "vaishnava", kind: "deity-form" },
  { tag: "Vijayanagara", slug: "vijayanagara", kind: "heritage" },
  { tag: "Wish-granting", slug: "wish-granting", kind: "experience" },
];

const BY_TAG = new Map(TAG_REGISTRY.map((e) => [e.tag, e]));
const BY_SLUG = new Map(TAG_REGISTRY.map((e) => [e.slug, e]));

export function isRegisteredTag(tag: string): boolean {
  return BY_TAG.has(tag);
}

export function getTagEntry(tag: string): TagRegistryEntry | undefined {
  return BY_TAG.get(tag);
}

export function getTagEntryBySlug(slug: string): TagRegistryEntry | undefined {
  return BY_SLUG.get(slug);
}

// Module-load-time self-check: every registry slug matches the shared slugify()
// convention, so countByTag()'s URL slugs and this registry never drift apart. Today
// this only actually runs under `npm run test` (lib/validate.ts and lib/popularity.ts
// import this module transitively) — nothing under app/ imports data/tag-registry.ts
// directly yet, so `npm run build` doesn't currently evaluate it. If a component ever
// imports this module directly, the throw would surface there too, mid-build.
for (const entry of TAG_REGISTRY) {
  if (slugify(entry.tag) !== entry.slug) {
    throw new Error(
      `data/tag-registry.ts: "${entry.tag}" slug mismatch — expected "${slugify(entry.tag)}", got "${entry.slug}"`,
    );
  }
}
