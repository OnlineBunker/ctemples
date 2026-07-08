import type { DeityKey } from "./deities";

/**
 * Colloquial/alternate names that should resolve to one of the six canonical deities
 * (see lib/deities.ts) when searched. Data, not code — extending this map is a
 * content-strategy decision, not a code review (per CLAUDE.md §8.4). Each entry
 * documents *why* it exists.
 */
export const SEARCH_ALIASES: Record<string, DeityKey> = {
  // Hindi/colloquial names for Shiva.
  mahadev: "shiva",
  mahadeva: "shiva",
  bhole: "shiva",
  // Shiva's cosmic-dancer form — a name searched independently of "Shiva" itself.
  nataraja: "shiva",

  // "Balaji" is the popular devotional nickname for Venkateswara (Tirumala) — a
  // Vishnu form searched far more often than "Vishnu" itself.
  balaji: "vishnu",
  venkateswara: "vishnu",

  // Principal Devi forms/nicknames searched independently of "Devi".
  durga: "devi",
  parvati: "devi",
  // Tamil honorific for the Goddess (as in "Meenakshi Amman").
  amman: "devi",

  // Common alternate names for Ganesha.
  vinayak: "ganesha",
  ganpati: "ganesha",

  // Sanskrit name for Murugan, searched independently of "Murugan".
  kartikeya: "murugan",

  // Popular devotional nickname for Hanuman.
  bajrangbali: "hanuman",
};
