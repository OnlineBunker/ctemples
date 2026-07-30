import type { MetadataRoute } from "next";
import { SITE_URL, INDEXABLE } from "@/lib/site";

/**
 * robots.txt. Previously absent entirely, which left crawler behaviour to chance — and left the
 * site-wide `noindex` meta tag as the only signal, one a crawler only sees *after* fetching every
 * page.
 *
 * While the site is not indexable this disallows everything outright, so crawl budget is never
 * spent on prototype content. Once `NEXT_PUBLIC_INDEXABLE=true`, it opens up and advertises the
 * sitemap — with `/wishlist` still excluded, since that page is rendered purely from the
 * visitor's own `localStorage` and has nothing shared to index.
 */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/wishlist"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
