/**
 * Single source of truth for the site's own identity — its canonical origin and whether search
 * engines may index it.
 *
 * Why this exists: `metadataBase` was hardcoded to `https://ctemples.example`, a placeholder
 * domain. Every absolute URL Next derives from it (canonicals, Open Graph `url`, OG image URLs,
 * the sitemap) therefore pointed at a domain nobody owns, which silently breaks link previews
 * and canonicalisation the moment the site is shared. Reading it from the environment means the
 * deployed origin is correct without a code change.
 *
 * INDEXABLE is deliberately OFF by default. docs/12/13 hold the project to a prototype-wide
 * `noindex` until the deploy-readiness phase explicitly flips it, and the footer still says
 * "frontend prototype · placeholder content" — indexing that would be actively harmful. Going
 * live is therefore one environment variable (`NEXT_PUBLIC_INDEXABLE=true`), not a refactor.
 */
const FALLBACK_URL = "http://localhost:3000";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_URL;
  try {
    // Normalise away a trailing slash so `${SITE_URL}/explore` never doubles it.
    return new URL(raw).origin;
  } catch {
    return FALLBACK_URL;
  }
}

export const SITE_URL = resolveSiteUrl();

/** Search engines may index the site only when explicitly switched on for the environment. */
export const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === "true";

export const SITE_NAME = "CTemples";
