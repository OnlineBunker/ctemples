import type { Temple } from "./types";

/**
 * Deity navigation is a curated surface (homepage "By deity" tiles, and later the
 * Explore deity filter). The dataset's `deity` field is free-text prose
 * ("Vishwanath (Shiva), one of the twelve Jyotirlingas"), so membership is derived
 * by keyword matching rather than a slug — this keeps the helper pure and lets the
 * full 20,000+ set drop in without a schema change. Nothing here assumes a count.
 */

export type DeityKey = "shiva" | "vishnu" | "devi" | "ganesha" | "murugan" | "hanuman";

export type DeityIcon = "trishul" | "chakra" | "lotus" | "ankusha" | "vel" | "gadaa";

export interface DeityMeta {
  key: DeityKey;
  label: string;
  /** Icon id consumed by components/brand/deity-icons.tsx. */
  icon: DeityIcon;
  /** Hex accent (inline style / border) — avoids Tailwind dynamic-class purging. */
  accent: string;
  /** Case-insensitive matcher over deity + name + tags. */
  match: RegExp;
}

export const DEITY_ORDER: DeityKey[] = [
  "shiva",
  "vishnu",
  "devi",
  "ganesha",
  "murugan",
  "hanuman",
];

export const DEITY_META: Record<DeityKey, DeityMeta> = {
  shiva: {
    key: "shiva",
    label: "Shiva",
    icon: "trishul",
    accent: "#E5006D",
    match:
      /shiva|mahadev|jyotirlinga|nataraja|vishwanath|vishweshwara|kedarnath|somnath|brihadees|virupaksha|ramanathaswamy|sundareswarar|kaal bhairav/i,
  },
  vishnu: {
    key: "vishnu",
    label: "Vishnu",
    icon: "chakra",
    accent: "#FF7A00",
    match: /vishnu|venkateswara|balaji|jagannath|krishna|\brama\b|ranganatha|narayana/i,
  },
  devi: {
    key: "devi",
    label: "Devi",
    icon: "lotus",
    accent: "#FFC300",
    match: /devi|parvati|shakti|amman|kamakhya|meenakshi|durga|mata rani|pampa|adi shakti/i,
  },
  ganesha: {
    key: "ganesha",
    label: "Ganesha",
    icon: "ankusha",
    accent: "#2E7D32",
    match: /ganesha|ganesh|vinayak/i,
  },
  murugan: {
    key: "murugan",
    label: "Murugan",
    icon: "vel",
    accent: "#3E6CC4",
    match: /murugan|kartikeya|subrahmany|skanda|\bvel\b/i,
  },
  hanuman: {
    key: "hanuman",
    label: "Hanuman",
    icon: "gadaa",
    accent: "#FF3D6E",
    match: /hanuman|anjaneya|maruti|bajrang/i,
  },
};

function haystack(t: Temple): string {
  return `${t.deity} ${t.name} ${t.tags.join(" ")}`;
}

/** Does a temple belong under a given deity? */
export function matchesDeity(temple: Temple, key: DeityKey): boolean {
  return DEITY_META[key].match.test(haystack(temple));
}

/** Count of temples under each of the six canonical deities (zeros included). */
export function countByDeity(list: Temple[]): Record<DeityKey, number> {
  const counts = Object.fromEntries(DEITY_ORDER.map((k) => [k, 0])) as Record<DeityKey, number>;
  for (const t of list) {
    for (const key of DEITY_ORDER) {
      if (matchesDeity(t, key)) counts[key] += 1;
    }
  }
  return counts;
}

/** Temples under a deity, highest rating first. */
export function pickByDeityKey(list: Temple[], key: DeityKey, limit?: number): Temple[] {
  const matched = list
    .filter((t) => matchesDeity(t, key))
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
  return typeof limit === "number" ? matched.slice(0, limit) : matched;
}
