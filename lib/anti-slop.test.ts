import { describe, it, expect } from "vitest";
import {
  checkBannedPhrases,
  checkNGramDedupe,
  checkUnsourcedNumbers,
  checkOpenerDiversity,
  checkWhyVisitVoice,
  splitSentences,
  type ProseRecord,
} from "./anti-slop";

describe("splitSentences", () => {
  it("splits on sentence-ending punctuation", () => {
    expect(splitSentences("First sentence. Second sentence! Third?")).toEqual([
      "First sentence.",
      "Second sentence!",
      "Third?",
    ]);
  });
});

describe("checkBannedPhrases", () => {
  it("flags an 'anywhere' phrase wherever it appears", () => {
    const records: ProseRecord[] = [{ id: "a", fields: { overview: "A hidden gem in the hills." } }];
    const findings = checkBannedPhrases(records);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ templeId: "a", field: "overview", rule: "banned-phrase" });
  });

  it("flags an 'opener' phrase only when a sentence begins with it", () => {
    const openerHit: ProseRecord[] = [{ id: "a", fields: { overview: "Breathtaking carvings cover every wall." } }];
    const midSentence: ProseRecord[] = [{ id: "b", fields: { overview: "The carvings are simply breathtaking in scale." } }];
    expect(checkBannedPhrases(openerHit).some((f) => f.rule === "banned-phrase-opener")).toBe(true);
    expect(checkBannedPhrases(midSentence).some((f) => f.rule === "banned-phrase-opener")).toBe(false);
  });

  it("passes clean prose", () => {
    const records: ProseRecord[] = [{ id: "a", fields: { overview: "A stone shrine on the eastern coast." } }];
    expect(checkBannedPhrases(records)).toEqual([]);
  });

  it("reports a single finding for one violation even when a variant form also matches the canonical phrase's rule", () => {
    // "delves" contains "delve" as a substring — this must not double-count as two
    // separate rule violations for what is really one instance of banned phrasing.
    const records: ProseRecord[] = [{ id: "a", fields: { overview: "Visitors can delves into the temple's past." } }];
    const findings = checkBannedPhrases(records);
    expect(findings).toHaveLength(1);
    expect(findings[0].detail).toContain('"delve"');
  });
});

describe("checkNGramDedupe", () => {
  const TEN_WORDS = "the quick brown fox jumps over the lazy sleeping dog";

  it("does not flag a 10-gram shared by 3 or fewer records", () => {
    const records: ProseRecord[] = [
      { id: "a", fields: { overview: TEN_WORDS } },
      { id: "b", fields: { overview: TEN_WORDS } },
      { id: "c", fields: { overview: TEN_WORDS } },
    ];
    expect(checkNGramDedupe(records)).toEqual([]);
  });

  it("flags the newest record once a 10-gram is shared by more than 3 records", () => {
    const records: ProseRecord[] = [
      { id: "a", fields: { overview: TEN_WORDS } },
      { id: "b", fields: { overview: TEN_WORDS } },
      { id: "c", fields: { overview: TEN_WORDS } },
      { id: "d", fields: { overview: TEN_WORDS } },
    ];
    const findings = checkNGramDedupe(records);
    expect(findings).toHaveLength(1);
    expect(findings[0].templeId).toBe("d");
  });

  it("does not flag distinct prose", () => {
    const records: ProseRecord[] = [
      { id: "a", fields: { overview: "A unique description of temple one entirely." } },
      { id: "b", fields: { overview: "A completely different description for temple two." } },
    ];
    expect(checkNGramDedupe(records)).toEqual([]);
  });
});

describe("checkUnsourcedNumbers", () => {
  it("flags a precise digit-based visitor count", () => {
    const records: ProseRecord[] = [{ id: "a", fields: { overview: "The temple welcomes 12,431 visitors every year." } }];
    expect(checkUnsourcedNumbers(records)).toHaveLength(1);
  });

  it("flags a 'X million visitors' claim", () => {
    const records: ProseRecord[] = [{ id: "a", fields: { overview: "It draws 2.5 million pilgrims annually." } }];
    expect(checkUnsourcedNumbers(records)).toHaveLength(1);
  });

  it("does not flag a vague, non-numeric claim", () => {
    const records: ProseRecord[] = [{ id: "a", fields: { overview: "It draws many devotees throughout the year." } }];
    expect(checkUnsourcedNumbers(records)).toEqual([]);
  });

  it("does not flag an unrelated number", () => {
    const records: ProseRecord[] = [{ id: "a", fields: { overview: "Built in the 11th century, it rises 65 metres." } }];
    expect(checkUnsourcedNumbers(records)).toEqual([]);
  });
});

describe("checkOpenerDiversity", () => {
  it("does not flag a unique opener", () => {
    const records: ProseRecord[] = [
      { id: "a", fields: { overview: "A coastal shrine of quiet stone." } },
      { id: "b", fields: { overview: "High in the mountains, this temple endures." } },
    ];
    expect(checkOpenerDiversity(records)).toEqual([]);
  });

  it("warns (not errors) when an opener repeats beyond the 2% cap", () => {
    const records: ProseRecord[] = [
      { id: "a", fields: { overview: "A stone temple by the sea." } },
      { id: "b", fields: { overview: "A stone temple in the hills." } },
    ];
    const findings = checkOpenerDiversity(records);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe("warn");
  });
});

describe("checkWhyVisitVoice", () => {
  const wordsInRange = Array.from({ length: 50 }, () => "word").join(" ");

  it("passes a 2nd-person whyVisit within 40-90 words", () => {
    const records: ProseRecord[] = [{ id: "a", fields: { whyVisit: `You will find ${wordsInRange}.` } }];
    expect(checkWhyVisitVoice(records)).toEqual([]);
  });

  it("warns when whyVisit has no second-person address", () => {
    const records: ProseRecord[] = [{ id: "a", fields: { whyVisit: `Visitors will find ${wordsInRange}.` } }];
    const findings = checkWhyVisitVoice(records);
    expect(findings.some((f) => f.rule === "voice-contract-second-person")).toBe(true);
  });

  it("warns when whyVisit is outside the 40-90 word range", () => {
    const tooShort: ProseRecord[] = [{ id: "a", fields: { whyVisit: "You will love this short one." } }];
    const findings = checkWhyVisitVoice(tooShort);
    expect(findings.some((f) => f.rule === "voice-contract-length")).toBe(true);
  });
});
