import type { MetadataRoute } from "next";
import { getTempleIds } from "@/lib/temples";
import { DEITY_ORDER } from "@/lib/deities";
import { STATE_REGION } from "@/lib/regions";
import { slugify } from "@/lib/utils";
import { SITE_URL, INDEXABLE } from "@/lib/site";

/**
 * Generated sitemap covering every real route — the static pages plus all temple, state, and
 * deity entries. Built from the data seam and the geography registry rather than a hand-written
 * list, so new records appear automatically and no URL can silently drift out of the sitemap.
 *
 * While the site is `noindex` (see lib/site.ts) an empty sitemap is served: advertising URLs
 * that every page then tells crawlers not to index is a contradictory signal, and Search Console
 * reports it as an error.
 *
 * `priority`/`changeFrequency` reflect real editorial weight: temple entries are the payload,
 * the discovery surfaces above them change more often, and the thin policy pages rank lowest.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!INDEXABLE) return [];

  const now = new Date();
  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  ) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority });

  const staticRoutes = [
    entry("/", 1.0, "daily"),
    entry("/explore", 0.9, "daily"),
    entry("/states", 0.8, "weekly"),
    entry("/deities", 0.8, "weekly"),
    entry("/about", 0.5, "monthly"),
    entry("/methodology", 0.5, "monthly"),
    entry("/suggest", 0.4, "monthly"),
  ];

  // /wishlist is intentionally absent: it renders only from the visitor's own localStorage, so
  // it has no shared content for a crawler to index.

  const temples = (await getTempleIds()).map((id) => entry(`/temples/${id}`, 0.9, "monthly"));
  const states = Object.keys(STATE_REGION).map((name) => entry(`/states/${slugify(name)}`, 0.7, "weekly"));
  const deities = DEITY_ORDER.map((key) => entry(`/deities/${key}`, 0.7, "weekly"));

  return [...staticRoutes, ...temples, ...states, ...deities];
}
