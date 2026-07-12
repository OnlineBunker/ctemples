/**
 * SEO metadata helpers (docs/12 §2). The prototype stays `noindex` (root layout), but
 * titles/descriptions still render — [NOW] items per docs/12's header note.
 */

const MAX_TITLE_LENGTH = 60;

/**
 * `/temples/[id]` title (docs/12 §2): "{Name}, {City} — history, timings & how to visit",
 * truncating the city first when over 60 characters, then the tail, before ever cutting
 * the temple's own name.
 */
export function buildTempleTitle(name: string, city: string): string {
  const suffix = "— history, timings & how to visit";
  const withCity = `${name}, ${city} ${suffix}`;
  if (withCity.length <= MAX_TITLE_LENGTH) return withCity;

  const withoutCity = `${name} ${suffix}`;
  if (withoutCity.length <= MAX_TITLE_LENGTH) return withoutCity;

  return `${withoutCity.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`;
}

/**
 * `/temples/[id]` description (docs/12 §2): first 155 characters of `whyVisit`, falling
 * back to the tagline, then the overview — hand-written text, never generated-for-SEO.
 */
export function buildTempleDescription(fields: { whyVisit?: string; tagline?: string; overview: string }): string {
  const source = fields.whyVisit?.trim() || fields.tagline?.trim() || fields.overview;
  return source.slice(0, 155);
}
