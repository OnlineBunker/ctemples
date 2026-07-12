import type { DeityKey } from "./deities";
import { slugify } from "./utils";

/**
 * Composable alias targets (docs/10 §4, D10). An alias can point at more than one kind
 * of entity at once — "jagannath" is both a Vishnu form AND names its home city, so it
 * carries a deity target and a place target together; "balaji" pins one specific temple
 * on top of its deity match. Weights are applied in lib/search.ts's `targetScore`.
 */
export type AliasTarget =
  | { type: "deity"; key: DeityKey }
  | { type: "temple"; slug: string }
  | { type: "place"; city?: string; stateSlug?: string }
  | { type: "tag"; tag: string };

export interface SearchAlias {
  alias: string;
  targets: AliasTarget[];
  /** Required why-doc (docs/10 §4 governance) — extending this list is a content-strategy
   *  decision, not a code review (CLAUDE.md §8.4). */
  note: string;
}

/**
 * Colloquial/alternate names and composite entity aliases (docs/10 §4). Data, not code.
 * `lib/search-aliases.test.ts` is the CI gate: every target here must resolve against
 * the real dataset/registries, or the build fails — a typo'd alias cannot ship.
 *
 * Deliberately NOT modeled (per D11's own instruction on how to handle them, not a gap):
 * "ayyappa" and "kanchipuram" have no resolvable target in the current 15-record
 * dataset (no Kerala/Sabarimala temple, no Kanchipuram-city temple) — the CI
 * target-resolution gate above would reject a place/temple target with nothing to
 * point at. Add them the day a matching temple ships (docs/10 §8's own "kanchipuram
 * … zero results until such a temple exists" note already documents this as expected,
 * not broken).
 */
export const SEARCH_ALIASES: SearchAlias[] = [
  {
    alias: "mahadev",
    targets: [{ type: "deity", key: "shiva" }],
    note: "Hindi/colloquial name for Shiva.",
  },
  {
    alias: "mahadeva",
    targets: [{ type: "deity", key: "shiva" }],
    note: "Sanskrit variant of mahadev.",
  },
  {
    alias: "bhole",
    targets: [{ type: "deity", key: "shiva" }],
    note: "Devotional nickname for Shiva ('Bhole Nath').",
  },
  {
    alias: "nataraja",
    targets: [{ type: "deity", key: "shiva" }],
    note: "Shiva's cosmic-dancer form — searched independently of 'Shiva' itself.",
  },
  {
    alias: "balaji",
    targets: [{ type: "deity", key: "vishnu" }, { type: "temple", slug: "tirumala-venkateswara-temple" }],
    note:
      "Popular devotional nickname for Venkateswara — pins Tirumala directly on top of the " +
      "deity match (docs/10 §4's own worked example), since that's overwhelmingly what " +
      "'Balaji' means in search intent, not Vishnu forms generally.",
  },
  {
    alias: "venkateswara",
    targets: [{ type: "deity", key: "vishnu" }],
    note: "Formal name of the Vishnu form worshipped at Tirumala and elsewhere — a general deity match, not pinned to one temple the way the 'balaji' nickname is.",
  },
  {
    alias: "jagannath",
    targets: [{ type: "deity", key: "vishnu" }, { type: "place", city: "Puri" }],
    note:
      "Composable-alias worked example (docs/10 §4): Jagannath is a Vishnu/Krishna form " +
      "AND names Puri, its home city — both targets fire together.",
  },
  {
    alias: "durga",
    targets: [{ type: "deity", key: "devi" }],
    note: "Principal Devi form, searched independently of 'Devi'.",
  },
  {
    alias: "parvati",
    targets: [{ type: "deity", key: "devi" }],
    note: "Principal Devi form, searched independently of 'Devi'.",
  },
  {
    alias: "amman",
    targets: [{ type: "deity", key: "devi" }],
    note: "Tamil honorific for the Goddess (as in 'Meenakshi Amman').",
  },
  {
    alias: "vinayak",
    targets: [{ type: "deity", key: "ganesha" }],
    note: "Common alternate name for Ganesha.",
  },
  {
    alias: "ganpati",
    targets: [{ type: "deity", key: "ganesha" }],
    note: "Common alternate name for Ganesha.",
  },
  {
    alias: "kartikeya",
    targets: [{ type: "deity", key: "murugan" }],
    note: "Sanskrit name for Murugan, searched independently of 'Murugan'.",
  },
  {
    alias: "bajrangbali",
    targets: [{ type: "deity", key: "hanuman" }],
    note: "Popular devotional nickname for Hanuman.",
  },
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Aliases that fire for a query, per-token/word-boundary matching (docs/10 §4) — fixes
 * the earlier whole-query-only limitation: "mahadev temple ujjain" now fires the
 * "mahadev" alias exactly like a bare "mahadev" query does. Longest-alias-first so that,
 * if a future multi-word alias and a shorter alias share a word, the longer/more-specific
 * one is visited first (word-boundary regex already prevents literal substring
 * false-positives — e.g. "mahadev" never matches inside "mahadeva" — so this ordering is
 * a determinism/priority guarantee for `matchedAliases`, not a correctness requirement
 * for the current single-word alias set).
 */
export function matchAliases(query: string): SearchAlias[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return [...SEARCH_ALIASES]
    .sort((a, b) => b.alias.length - a.alias.length)
    .filter((a) => new RegExp(`\\b${escapeRegExp(a.alias)}\\b`, "i").test(q));
}

function findAlias(key: string): SearchAlias | undefined {
  return SEARCH_ALIASES.find((a) => a.alias === key);
}

/**
 * A single target's display label (docs/10 §4: "Banner copy resolves the canonical
 * label from the first target"). Deity → its display name; temple → the temple's own
 * name; place → city (falling back to the state a matching temple carries, since
 * `stateSlug` alone isn't display-ready); tag → the tag string as stored. Split out from
 * `resolveAliasLabel` so it's directly unit-testable with a synthetic target, without
 * needing to inject a fake entry into the real `SEARCH_ALIASES` list.
 */
export function resolveTargetLabel(
  target: AliasTarget,
  temples: { id: string; name: string; state: string }[],
  deityLabel: (key: DeityKey) => string,
  fallback: string,
): string {
  switch (target.type) {
    case "deity":
      return deityLabel(target.key);
    case "temple":
      return temples.find((t) => t.id === target.slug)?.name ?? fallback;
    case "place":
      if (target.city) return target.city;
      return temples.find((t) => target.stateSlug && slugify(t.state) === target.stateSlug)?.state ?? fallback;
    case "tag":
      return target.tag;
  }
}

/**
 * The smart-match banner's display label for a fired alias key. Takes the full temple
 * list so temple/place targets can resolve real names — computed once inside the seam
 * (`runExploreQuery`), never re-fetched by a page (D25).
 */
export function resolveAliasLabel(
  aliasKey: string,
  temples: { id: string; name: string; state: string }[],
  deityLabel: (key: DeityKey) => string,
): string {
  const target = findAlias(aliasKey)?.targets[0];
  return target ? resolveTargetLabel(target, temples, deityLabel, aliasKey) : aliasKey;
}
