export interface BannedPhrase {
  /** Canonical label used in finding messages. */
  phrase: string;
  /** Other literal surface forms of the same rule (e.g. conjugations) — a match on any
   * of these counts as one hit for `phrase`, not a separate finding. */
  variants?: string[];
  /** "anywhere": flag any occurrence. "opener": flag only when a sentence begins with it. */
  context: "anywhere" | "opener";
}

/**
 * Versioned, extendable banned-phrase lexicon (docs/01 §3.2, docs/09 §7) — data, not
 * code, so growing it never needs a script change. Seed list is the charter's own.
 */
export const ANTI_SLOP_LEXICON_VERSION = 1;

export const BANNED_PHRASES: BannedPhrase[] = [
  { phrase: "nestled", context: "anywhere" },
  { phrase: "rich tapestry", context: "anywhere" },
  { phrase: "hidden gem", context: "anywhere" },
  { phrase: "must-visit", context: "anywhere" },
  { phrase: "breathtaking", context: "opener" },
  { phrase: "steeped in history", context: "anywhere" },
  { phrase: "delve", variants: ["delves", "delving", "delved"], context: "anywhere" },
  { phrase: "vibrant culture", context: "anywhere" },
  { phrase: "spiritual journey", context: "anywhere" },
  { phrase: "stands as a testament", context: "anywhere" },
];
