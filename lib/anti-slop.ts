import { BANNED_PHRASES } from "@/data/anti-slop";

/**
 * Pure anti-slop checks over prose (docs/01 §3.2, docs/09 §7, D15) — takes plain
 * records, no content-array import, so it's unit-testable independent of
 * data/temples.ts. scripts/lint-anti-slop.ts does the I/O (reads data/temples.ts,
 * prints the report, sets the exit code).
 *
 * Length-variance (docs/09 §7's per-tier word-count σ-floor) is deliberately not
 * implemented here — it's a distribution check that's statistically meaningless over
 * 15 records; it lands when the corpus is large enough for a distribution to exist.
 */

export type Severity = "error" | "warn";

export interface AntiSlopFinding {
  severity: Severity;
  templeId: string;
  field: string;
  rule: string;
  detail: string;
}

export interface ProseRecord {
  id: string;
  /** field name -> prose text (only the fields worth linting) */
  fields: Record<string, string>;
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

/** Rule 2 (docs/01 §3.2): the versioned lexicon, "anywhere" or sentence-"opener". */
export function checkBannedPhrases(records: ProseRecord[]): AntiSlopFinding[] {
  const findings: AntiSlopFinding[] = [];
  for (const record of records) {
    for (const [field, text] of Object.entries(record.fields)) {
      if (!text) continue;
      const lower = text.toLowerCase();
      const sentences = splitSentences(text).map((s) => s.toLowerCase());
      for (const { phrase, variants, context } of BANNED_PHRASES) {
        // All surface forms of one rule (e.g. "delve"/"delves"/"delving"/"delved") are
        // checked together and count as a single hit — a variant match must not also
        // separately trip its own rule, or one violation gets reported twice.
        const forms = [phrase, ...(variants ?? [])].map((f) => f.toLowerCase());
        if (context === "anywhere") {
          if (forms.some((f) => lower.includes(f))) {
            findings.push({
              severity: "error",
              templeId: record.id,
              field,
              rule: "banned-phrase",
              detail: `contains banned phrase "${phrase}"`,
            });
          }
        } else if (forms.some((f) => sentences.some((s) => s.startsWith(f)))) {
          findings.push({
            severity: "error",
            templeId: record.id,
            field,
            rule: "banned-phrase-opener",
            detail: `a sentence opens with banned phrase "${phrase}"`,
          });
        }
      }
    }
  }
  return findings;
}

const NGRAM_SIZE = 10;
const NGRAM_TOLERANCE = 3; // docs/09 §7: any 10-gram in >3 records fails (the newest)

/**
 * Rule 3 (docs/01 §3.2, docs/09 §7): cross-record 10-gram dedupe, ≤3 tolerated, "fails
 * the newest". The prototype Temple schema has no creation timestamp yet (docs/09 §2's
 * `Editorial.createdAt` is Stage B) — "newest" is approximated here as last-in-array
 * order, which is only meaningful while data/temples.ts's literal order reflects
 * authoring order. This approximation must be replaced with real `createdAt` ordering
 * once the schema evolves; until then a re-sorted array would misattribute the blame.
 */
export function checkNGramDedupe(records: ProseRecord[]): AntiSlopFinding[] {
  const owners = new Map<string, string[]>(); // ngram -> temple ids, first-seen order

  for (const record of records) {
    const words = normalizeWords(Object.values(record.fields).join(" "));
    const seenInThisRecord = new Set<string>();
    for (let i = 0; i + NGRAM_SIZE <= words.length; i++) {
      const gram = words.slice(i, i + NGRAM_SIZE).join(" ");
      if (seenInThisRecord.has(gram)) continue;
      seenInThisRecord.add(gram);
      const list = owners.get(gram) ?? [];
      list.push(record.id);
      owners.set(gram, list);
    }
  }

  const findings: AntiSlopFinding[] = [];
  for (const [gram, ids] of owners) {
    if (ids.length > NGRAM_TOLERANCE) {
      const newest = ids[ids.length - 1];
      findings.push({
        severity: "error",
        templeId: newest,
        field: "(cross-record)",
        rule: "ngram-dedupe",
        detail: `shares the 10-gram "${gram}" with ${ids.length - 1} other record(s) — exceeds the ≤3 tolerance`,
      });
    }
  }
  return findings;
}

const VISITOR_COUNT_PATTERN =
  /\b\d[\d,]{2,}\+?\s+(visitors|pilgrims|devotees|worshippers)\b|\b\d+(\.\d+)?\s*(million|lakh|crore)\s+(visitors|pilgrims|devotees|worshippers)\b/i;

/**
 * Rule 5 (docs/01 §3.2) / docs/09 §6 step 4's `checkUnsourcedNumbers` tripwire: the
 * prototype schema has no `visitorStat` field yet, so any visitor-count-shaped prose
 * is unsourced by definition right now.
 */
export function checkUnsourcedNumbers(records: ProseRecord[]): AntiSlopFinding[] {
  const findings: AntiSlopFinding[] = [];
  for (const record of records) {
    for (const [field, text] of Object.entries(record.fields)) {
      if (!text) continue;
      const match = text.match(VISITOR_COUNT_PATTERN);
      if (match) {
        findings.push({
          severity: "error",
          templeId: record.id,
          field,
          rule: "unsourced-visitor-count",
          detail: `looks like an unsourced visitor-count claim: "${match[0]}"`,
        });
      }
    }
  }
  return findings;
}

const OPENER_WORDS = 3;
const OPENER_CAP_RATIO = 0.02;

/**
 * Rule 4 (docs/01 §3.2): no overview sentence-opener pattern > 2% of records.
 * Warn-only at prototype scale (docs/09 §7: "warn→error at scale") — 2% of 15 is well
 * under 1, so any 2-record repeat trips it; that's expected until the corpus is large
 * enough for the ratio to mean more than one record.
 */
export function checkOpenerDiversity(records: ProseRecord[]): AntiSlopFinding[] {
  const openers = new Map<string, string[]>();
  for (const record of records) {
    const overview = record.fields.overview;
    if (!overview) continue;
    const firstSentence = splitSentences(overview)[0] ?? overview;
    const opener = normalizeWords(firstSentence).slice(0, OPENER_WORDS).join(" ");
    if (!opener) continue;
    const ids = openers.get(opener) ?? [];
    ids.push(record.id);
    openers.set(opener, ids);
  }

  const findings: AntiSlopFinding[] = [];
  const total = records.length;
  for (const [opener, ids] of openers) {
    if (ids.length > 1 && ids.length / total > OPENER_CAP_RATIO) {
      findings.push({
        severity: "warn",
        templeId: ids[ids.length - 1],
        field: "overview",
        rule: "opener-diversity",
        detail: `opener "${opener}…" repeats across ${ids.length} records (${ids.join(", ")})`,
      });
    }
  }
  return findings;
}

const WHY_VISIT_MIN_WORDS = 40;
const WHY_VISIT_MAX_WORDS = 90;
const SECOND_PERSON = /\b(you|your|you're|yours)\b/i;

/**
 * Rule 1 (docs/01 §3.2): whyVisit 2nd person, 40–90 words. Warn-only — the
 * "≥1 concrete non-name noun phrase" half of the rule stays a reviewer-checklist
 * judgment call (docs/09 §6 step 5), not automatable here.
 */
export function checkWhyVisitVoice(records: ProseRecord[]): AntiSlopFinding[] {
  const findings: AntiSlopFinding[] = [];
  for (const record of records) {
    const text = record.fields.whyVisit;
    if (!text) continue;
    const wordCount = normalizeWords(text).length;
    if (wordCount < WHY_VISIT_MIN_WORDS || wordCount > WHY_VISIT_MAX_WORDS) {
      findings.push({
        severity: "warn",
        templeId: record.id,
        field: "whyVisit",
        rule: "voice-contract-length",
        detail: `whyVisit is ${wordCount} words, expected 40–90`,
      });
    }
    if (!SECOND_PERSON.test(text)) {
      findings.push({
        severity: "warn",
        templeId: record.id,
        field: "whyVisit",
        rule: "voice-contract-second-person",
        detail: `whyVisit has no second-person address ("you"/"your")`,
      });
    }
  }
  return findings;
}

export function runAntiSlopChecks(records: ProseRecord[]): AntiSlopFinding[] {
  return [
    ...checkBannedPhrases(records),
    ...checkNGramDedupe(records),
    ...checkUnsourcedNumbers(records),
    ...checkOpenerDiversity(records),
    ...checkWhyVisitVoice(records),
  ];
}
