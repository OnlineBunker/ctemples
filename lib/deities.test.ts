import { describe, it, expect } from "vitest";
import {
  DEITY_ORDER,
  DEITY_META,
  matchesDeity,
  countByDeity,
  pickByDeityKey,
} from "./deities";
import { makeTemple } from "./__fixtures__/temple";

const shiva = makeTemple({
  id: "kashi",
  name: "Kashi Vishwanath Temple",
  deity: "Vishwanath / Vishweshwara (Shiva), one of the twelve Jyotirlingas",
  tags: ["Jyotirlinga"],
  rating: 4.9,
});
const vishnu = makeTemple({
  id: "tirupati",
  name: "Tirumala Venkateswara Temple",
  deity: "Venkateswara / Balaji (a form of Vishnu)",
  tags: [],
  rating: 4.8,
});
const devi = makeTemple({
  id: "kamakhya",
  name: "Kamakhya Temple",
  deity: "Kamakhya Devi, a principal Shakti and Tantric goddess",
  tags: [],
  rating: 4.6,
});
const ganesha = makeTemple({
  id: "siddhivinayak",
  name: "Shree Siddhivinayak",
  deity: "Ganesha (as Shri Siddhivinayak)",
  tags: [],
  rating: 4.7,
});
// Meenakshi is worshipped as both the goddess and (with) Shiva — dual membership.
const meenakshi = makeTemple({
  id: "meenakshi",
  name: "Meenakshi Amman Temple",
  deity: "Meenakshi (Parvati) and Sundareswarar (Shiva)",
  tags: [],
  rating: 4.85,
});

const all = [shiva, vishnu, devi, ganesha, meenakshi];

describe("DEITY_ORDER / DEITY_META", () => {
  it("has six canonical deities with matching metadata", () => {
    expect(DEITY_ORDER).toHaveLength(6);
    for (const key of DEITY_ORDER) {
      expect(DEITY_META[key].key).toBe(key);
      expect(DEITY_META[key].label.length).toBeGreaterThan(0);
    }
  });
});

describe("matchesDeity", () => {
  it("matches on free-text deity prose", () => {
    expect(matchesDeity(shiva, "shiva")).toBe(true);
    expect(matchesDeity(vishnu, "vishnu")).toBe(true);
    expect(matchesDeity(devi, "devi")).toBe(true);
    expect(matchesDeity(ganesha, "ganesha")).toBe(true);
  });
  it("does not match unrelated deities", () => {
    expect(matchesDeity(vishnu, "shiva")).toBe(false);
    expect(matchesDeity(shiva, "murugan")).toBe(false);
    expect(matchesDeity(ganesha, "hanuman")).toBe(false);
  });
  it("allows dual membership (Meenakshi is both Devi and Shiva)", () => {
    expect(matchesDeity(meenakshi, "devi")).toBe(true);
    expect(matchesDeity(meenakshi, "shiva")).toBe(true);
  });
});

describe("countByDeity", () => {
  it("tallies all six, including zeroes for absent deities", () => {
    const counts = countByDeity(all);
    expect(counts.shiva).toBe(2); // kashi + meenakshi
    expect(counts.vishnu).toBe(1);
    expect(counts.devi).toBe(2); // kamakhya + meenakshi
    expect(counts.ganesha).toBe(1);
    expect(counts.murugan).toBe(0);
    expect(counts.hanuman).toBe(0);
  });
});

describe("pickByDeityKey", () => {
  it("returns matching temples, highest rating first", () => {
    const shivas = pickByDeityKey(all, "shiva");
    expect(shivas.map((t) => t.id)).toEqual(["kashi", "meenakshi"]);
  });
  it("respects a limit and returns [] when none match", () => {
    expect(pickByDeityKey(all, "shiva", 1).map((t) => t.id)).toEqual(["kashi"]);
    expect(pickByDeityKey(all, "hanuman")).toEqual([]);
  });
});
