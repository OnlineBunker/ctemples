import {
  getFeaturedTemples,
  getAllTemples,
  getStateCounts,
  getTopTemplesByState,
  getDeityCounts,
} from "@/lib/temples";
import { Hero } from "@/components/home/hero";
import type { HeroSlideData } from "@/components/home/hero-slide";
import { EditorialParagraph } from "@/components/home/editorial-paragraph";
import { TripIdeas } from "@/components/home/trip-ideas";
import { StateStrip } from "@/components/home/state-strip";
import type { StateStripItem } from "@/components/home/state-tile";
import { PopularSearches } from "@/components/home/popular-searches";
import { DeityTiles } from "@/components/home/deity-tiles";
import { MethodologyTeaser } from "@/components/home/methodology-teaser";

/**
 * Homepage (UX_SPEC §5.1). Everything below is derived from data/temples.ts — no count
 * is hardcoded — so the full 20,000+ library drops in without touching this file.
 * Section order: hero → editorial → trip ideas → state strip → popular searches →
 * deity tiles → methodology teaser. The language banner is mounted in the root layout.
 */
export default async function HomePage() {
  // Hero slides — featured first, falling back to any temples so the carousel is never empty.
  const featured = await getFeaturedTemples(6);
  const source = featured.length ? featured : (await getAllTemples()).slice(0, 6);
  const slides: HeroSlideData[] = source.map((t) => ({
    id: t.id,
    name: t.name,
    city: t.city,
    state: t.state,
    region: t.region,
    rating: t.rating,
    kind: "image",
    image: t.heroImage,
  }));

  // State strip — the richest states, each with its top temples for the popover.
  const topStateCounts = (await getStateCounts()).slice(0, 6);
  const stateItems: StateStripItem[] = await Promise.all(
    topStateCounts.map(async (sc) => ({
      state: sc.state,
      slug: sc.slug,
      region: sc.region,
      count: sc.count,
      top: (await getTopTemplesByState(sc.state, 4)).map((t) => ({
        id: t.id,
        name: t.name,
        city: t.city,
      })),
    })),
  );

  const deityCounts = await getDeityCounts();

  return (
    <>
      <Hero slides={slides} />
      <EditorialParagraph />
      <TripIdeas />
      <StateStrip states={stateItems} />
      <PopularSearches />
      <DeityTiles counts={deityCounts} />
      <MethodologyTeaser />
    </>
  );
}
