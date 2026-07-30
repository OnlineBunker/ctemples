import type { Metadata } from "next";
import { getAllTemples } from "@/lib/temples";
import { getHero } from "@/lib/media";
import { ThresholdHero, type ThresholdSlide } from "@/components/home/threshold-hero";
import { IndexList, type IndexRow } from "@/components/home/index-list";
import { FourDirections, type DirectionItem } from "@/components/home/four-directions";
import { InFocus, type FocusData } from "@/components/home/in-focus";
import { Finale } from "@/components/home/finale";

// Declared per route rather than in the root layout — a layout-level canonical is inherited by
// every child page, which would make each one claim to be a duplicate of "/".
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Homepage — the prototype composition, ported faithfully (docs/15 §0a):
 * Threshold hero → 01 The Index → 02 Four Directions → 03 In Focus → Finale.
 * Everything derives from data/temples.ts — no count or list is hardcoded.
 */
export default async function HomePage() {
  const temples = await getAllTemples();
  const heroUrl = (t: (typeof temples)[number]) => getHero(t.media)?.url ?? "";

  // Hero slideshow — the six most-photographed temples (the prototype's own pick).
  const slides: ThresholdSlide[] = temples
    .slice()
    .sort((a, b) => b.media.length - a.media.length)
    .slice(0, 6)
    .map((t) => ({ id: t.id, name: t.name, city: t.city, image: heroUrl(t) }));

  // 01 — The Index: every temple, numbered.
  const rows: IndexRow[] = temples.map((t, i) => ({
    id: t.id,
    num: pad(i + 1),
    name: t.name,
    loc: `${t.city} · ${t.state}`,
    img: heroUrl(t),
  }));

  // 02 — Four Directions: the cardinal regions, fronted by each one's most-photographed.
  const directions: DirectionItem[] = [];
  for (const name of ["South", "North", "East", "West"] as const) {
    const list = temples.filter((t) => t.region === name);
    if (!list.length) continue;
    const flag = list.slice().sort((a, b) => b.media.length - a.media.length)[0];
    directions.push({
      name,
      id: flag.id,
      img: heroUrl(flag),
      sub: `${list.length} ${list.length > 1 ? "TEMPLES" : "TEMPLE"} · ${flag.name}`.toUpperCase(),
    });
  }

  // 03 — In Focus: the featured editorial pick (docs/15 §0b — Konark's colossal stone
  // chariot; was Meenakshi, changed per owner directive 2026-07-28).
  const ft =
    temples.find((t) => t.id === "konark-sun-temple") ??
    temples.find((t) => t.id === "meenakshi-amman-temple") ??
    temples[0];
  const feat: FocusData | null = ft
    ? {
        id: ft.id,
        name: ft.name,
        img: heroUrl(ft),
        tagline: ft.tagline,
        why: ft.whyVisit,
        deity: ft.quickFacts.presidingDeity,
        built: ft.quickFacts.built || "—",
        style: ft.quickFacts.architecturalStyle || "—",
        caption: `${ft.name} — ${ft.city}, ${ft.state}`,
      }
    : null;

  return (
    <>
      <ThresholdHero slides={slides} templeCount={temples.length} />
      <IndexList rows={rows} />
      <FourDirections items={directions} />
      {feat ? <InFocus feat={feat} /> : null}
      <Finale names={temples.map((t) => t.name)} />
    </>
  );
}
