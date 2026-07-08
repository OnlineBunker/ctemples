import type { Metadata } from "next";
import { getAllTemples } from "@/lib/temples";
import { ExploreClient } from "@/components/explore/explore-client";
import { REGION_ORDER } from "@/lib/regions";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Region } from "@/lib/types";
import type { SortKey } from "@/lib/filter";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Search and filter India's temples by region, tradition, and feature — then step through into each one's full story.",
};

const VALID_SORT: SortKey[] = ["featured", "rating", "name", "cost"];

function toArray(value?: string | string[]): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // NOTE: the full array is handed to the client here — fine for a static prototype.
  // At true scale, paginate/search on the server and stream pages instead.
  const temples = getAllTemples();

  const regions = toArray(sp.region).filter((r): r is Region =>
    REGION_ORDER.includes(r as Region),
  );
  const tags = toArray(sp.tag);
  const query = typeof sp.q === "string" ? sp.q : "";
  const sortRaw = typeof sp.sort === "string" ? sp.sort : "featured";
  const sort = (VALID_SORT.includes(sortRaw as SortKey) ? sortRaw : "featured") as SortKey;

  return (
    <div className="shell py-16 md:py-20">
      <header className="max-w-3xl">
        <Eyebrow>The collection</Eyebrow>
        <h1 className="mt-5 font-display text-display-lg text-limewash">Explore every temple</h1>
        <p className="mt-5 text-lg leading-relaxed text-limewash/70">
          Search and filter the library by region, tradition, and feature. Pick a card to step
          through into its full story.
        </p>
      </header>

      <div className="mt-12">
        <ExploreClient temples={temples} initial={{ query, regions, tags, sort }} />
      </div>
    </div>
  );
}
