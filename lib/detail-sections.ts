import type { Temple } from "./types";
import { getGallery } from "./media";
import {
  pickWithinRadius,
  pickByDeity,
  pickByArchitecturalStyle,
  pickSameRegionTopRated,
  type NearbyResult,
} from "./temple-queries";

/**
 * The temple detail page's section engine (docs/06 §1, D13): the page never branches on
 * content tier — every section renders purely on data presence, computed here so
 * `app/temples/[id]/page.tsx` and the section index (D20) share one source of truth for
 * "what's visible" and "what number does it show".
 */

export interface ReachMode {
  key: "air" | "train" | "road";
  label: string;
  text: string;
}

/** Only the how-to-reach modes with real text (docs/06 §5 row 7: "renders when ≥1 mode"). */
export function reachModes(temple: Temple): ReachMode[] {
  const modes: ReachMode[] = [];
  if (temple.howToReach.byAir?.trim()) modes.push({ key: "air", label: "By air", text: temple.howToReach.byAir });
  if (temple.howToReach.byTrain?.trim())
    modes.push({ key: "train", label: "By train", text: temple.howToReach.byTrain });
  if (temple.howToReach.byRoad?.trim())
    modes.push({ key: "road", label: "By road", text: temple.howToReach.byRoad });
  return modes;
}

export interface RelatedSections {
  /** Section 15's real ≤100km matches (nearest first), capped at 4. Empty when none exist. */
  within100km: NearbyResult[];
  /** Section 15's fallback list (same-region, top-rated) — populated only when `within100km` is empty. */
  remoteFallback: Temple[];
  /** Section 16, deduped against section 15 (docs/06 §7: "a temple appears once, first section wins"). */
  sameDeity: Temple[];
  /** Section 17, deduped against sections 15 and 16. */
  sameStyle: Temple[];
}

/**
 * Resolves the three computed-discovery sections (15–17) plus the "Plan around" mini-list
 * (section 4 reuses section 15's own results — docs/06 §5 row 4: "up to 3 nearest temples
 * (from §15's computation)"), with cross-section dedup so a temple never appears twice.
 */
export function computeRelatedSections(temple: Temple, allTemples: Temple[]): RelatedSections {
  const within100km = pickWithinRadius(allTemples, temple.coordinates.lat, temple.coordinates.lng, 100, 4);
  const remoteFallback = within100km.length === 0 ? pickSameRegionTopRated(allTemples, temple, 4) : [];

  const shown = new Set<string>([
    ...within100km.map((r) => r.temple.id),
    ...remoteFallback.map((t) => t.id),
  ]);

  // Over-fetch (no limit) then dedup-and-slice ourselves, rather than slicing to 3 before
  // filtering — otherwise a real match could be dropped just for sorting behind an
  // already-shown temple.
  const sameDeityCandidates = pickByDeity(allTemples, temple, allTemples.length);
  const sameDeity = sameDeityCandidates.filter((t) => !shown.has(t.id)).slice(0, 3);
  sameDeity.forEach((t) => shown.add(t.id));

  const sameStyleCandidates = temple.architecturalStyleSlug
    ? pickByArchitecturalStyle(allTemples, temple, allTemples.length)
    : [];
  const sameStyle = sameStyleCandidates.filter((t) => !shown.has(t.id)).slice(0, 3);

  return { within100km, remoteFallback, sameDeity, sameStyle };
}

export interface VisibleSection {
  id: string;
  label: string;
  /** 1-based display index among visible sections only (docs/06 §1 acceptance criteria:
   *  "removing a section renumbers the rest"). Hero and the quick-facts bar aren't part of
   *  this numbered sequence — they're always-present chrome, not jump targets. */
  index: number;
}

interface SectionDef {
  id: string;
  label: string;
  visible: (temple: Temple, related: RelatedSections) => boolean;
}

const SECTION_DEFS: SectionDef[] = [
  { id: "why-visit", label: "Why visit", visible: (t) => !!t.whyVisit?.trim() },
  { id: "plan-around", label: "Plan around", visible: (t) => !!t.tripDuration },
  { id: "best-time", label: "Best time to visit", visible: (t) => !!t.bestTimeToVisit },
  { id: "overview", label: "Overview", visible: () => true },
  { id: "how-to-reach", label: "How to reach", visible: (t) => reachModes(t).length > 0 },
  { id: "history", label: "History", visible: (t) => !!t.history?.trim() },
  { id: "legends", label: "Legends & mythology", visible: (t) => !!t.legendsAndMythology?.trim() },
  { id: "architecture", label: "Architecture", visible: (t) => !!t.architecture?.trim() },
  {
    id: "spiritual-significance",
    label: "Spiritual significance",
    visible: (t) => !!t.spiritualSignificance?.trim(),
  },
  { id: "cost", label: "Cost to visit", visible: (t) => t.costEstimates.length > 0 },
  { id: "gallery", label: "Gallery", visible: (t) => getGallery(t.media).length >= 2 },
  { id: "map", label: "Find on the map", visible: () => true },
  {
    id: "within-100km",
    label: "Within 100 km",
    visible: (_t, r) => r.within100km.length > 0 || r.remoteFallback.length > 0,
  },
  { id: "same-deity", label: "By the same deity", visible: (_t, r) => r.sameDeity.length > 0 },
  {
    id: "same-style",
    label: "Same architectural style",
    visible: (t, r) => !!t.architecturalStyleSlug && r.sameStyle.length > 0,
  },
  { id: "nearby-attractions", label: "Nearby attractions", visible: (t) => t.nearbyAttractions.length > 0 },
];

export function visibleSections(temple: Temple, related: RelatedSections): VisibleSection[] {
  const out: VisibleSection[] = [];
  let index = 0;
  for (const def of SECTION_DEFS) {
    if (def.visible(temple, related)) {
      index += 1;
      out.push({ id: def.id, label: def.label, index });
    }
  }
  return out;
}

/** Convenience lookup for the page: is a given section id in the visible set? */
export function isSectionVisible(sections: VisibleSection[], id: string): boolean {
  return sections.some((s) => s.id === id);
}
