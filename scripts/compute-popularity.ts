import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { temples } from "../data/temples";
import wikiPageviews from "../data/wiki-pageviews.json";
import { computePopularityScore } from "../lib/popularity";

/**
 * Regenerates data/popularity.json (docs/09 §4, D12). Deterministic and offline: the
 * only inputs are the two committed files (data/temples.ts, data/wiki-pageviews.json),
 * so re-running this produces byte-identical output until one of them changes.
 * `wikiPageviews` itself is a one-time, separately-fetched snapshot (see its own
 * `fetchedAt`/`source` fields) — this script never calls the network.
 *
 * Run: npm run popularity
 */

const viewsById = new Map(wikiPageviews.entries.map((e) => [e.id, e.wikiViews]));
const maxWikiViews = Math.max(...wikiPageviews.entries.map((e) => e.wikiViews));

interface PopularityRecord {
  id: string;
  score: number;
  basis: "blended";
  computedAt: string;
}

const popularity: PopularityRecord[] = temples.map((t) => ({
  id: t.id,
  score: computePopularityScore({
    wikiViews: viewsById.get(t.id) ?? 0,
    maxWikiViews,
    tags: t.tags,
    featured: t.featured,
    rating: t.rating,
  }),
  basis: "blended",
  // Deliberately the input snapshot's fetchedAt, not this run's wall-clock time: using
  // `new Date()` here would make two runs against unchanged inputs produce different
  // output, breaking the "regenerates byte-identically from committed inputs"
  // requirement (docs/09 §10). This does mean computedAt tracks input freshness, not
  // "when the score was last recalculated" — re-running after only a data/temples.ts
  // edit (rating/tags/featured) produces a genuinely different score under the same
  // computedAt date.
  computedAt: wikiPageviews.fetchedAt,
}));

// Sorted score desc (ties: rating desc, name asc) so the committed file itself doubles
// as a readable "Most visited" preview — lookups are still by `id`, order is cosmetic.
const byId = new Map(temples.map((t) => [t.id, t]));
popularity.sort((a, b) => {
  const ta = byId.get(a.id)!;
  const tb = byId.get(b.id)!;
  return b.score - a.score || tb.rating - ta.rating || ta.name.localeCompare(tb.name);
});

const outPath = resolve(__dirname, "../data/popularity.json");
writeFileSync(outPath, JSON.stringify(popularity, null, 2) + "\n");
console.log(`Wrote ${popularity.length} popularity scores to data/popularity.json`);
