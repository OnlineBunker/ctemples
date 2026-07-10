import type { Temple, Region } from "./types";
import { REGION_ORDER } from "./regions";
import { isRegisteredTag } from "@/data/tag-registry";

/**
 * Dev-time data-shape validation. Not a runtime dependency of the UI — it guards
 * hand-authored (and later, generated) content so a malformed record is caught at
 * build/test time rather than rendering broken. Unit-tested — see validate.test.ts.
 */

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REGIONS = new Set<Region>(REGION_ORDER);

// Rough mainland + island bounding box for India, used as a sanity check on coordinates.
const INDIA_BOUNDS = { latMin: 6, latMax: 37.5, lngMin: 68, lngMax: 97.5 };

export function validateTemple(t: Temple): string[] {
  const issues: string[] = [];
  const check = (cond: boolean, msg: string) => {
    if (!cond) issues.push(msg);
  };

  check(SLUG.test(t.id ?? ""), `id "${t.id}" is not a url-safe slug`);
  check(!!t.name?.trim(), "name is empty");
  check(!!t.state?.trim(), "state is empty");
  check(!!t.city?.trim(), "city is empty");
  check(REGIONS.has(t.region), `region "${t.region}" is not one of ${[...REGIONS].join(", ")}`);
  check(!!t.deity?.trim(), "deity is empty");
  check(!!t.tagline?.trim(), "tagline is empty");
  check(!!t.overview?.trim(), "overview is empty");
  check(typeof t.rating === "number" && t.rating >= 0 && t.rating <= 5, `rating ${t.rating} out of range 0–5`);

  const { lat, lng } = t.coordinates ?? { lat: NaN, lng: NaN };
  check(
    lat >= INDIA_BOUNDS.latMin && lat <= INDIA_BOUNDS.latMax,
    `lat ${lat} is outside India's bounds`,
  );
  check(
    lng >= INDIA_BOUNDS.lngMin && lng <= INDIA_BOUNDS.lngMax,
    `lng ${lng} is outside India's bounds`,
  );

  check(
    Array.isArray(t.costEstimates) && t.costEstimates.length >= 3 && t.costEstimates.length <= 4,
    `expected 3–4 cost estimates, got ${t.costEstimates?.length ?? 0}`,
  );
  check(Array.isArray(t.gallery) && t.gallery.length >= 1, "gallery has no entries");
  check(Array.isArray(t.tags) && t.tags.length >= 1, "no tags");
  (t.tags ?? []).forEach((tag) => {
    check(isRegisteredTag(tag), `tag "${tag}" is not in the controlled registry (data/tag-registry.ts)`);
  });

  const sentenceCount = (t.whyVisit ?? "")
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  check(sentenceCount >= 3, `whyVisit has ${sentenceCount} sentence(s), expected at least 3`);

  check(SLUG.test(t.architecturalStyleSlug ?? ""), `architecturalStyleSlug "${t.architecturalStyleSlug}" is not a url-safe slug`);

  check(Array.isArray(t.media) && t.media.length >= 1, "media has no entries");
  (t.media ?? []).forEach((m, i) => {
    check(m.kind === "image" || m.kind === "video", `media[${i}].kind must be "image" or "video"`);
    check(!!m.url?.trim(), `media[${i}].url is empty`);
    check(!!m.alt?.trim(), `media[${i}].alt is empty`);
  });

  if (t.tripDuration) {
    check(t.tripDuration.temples > 0, "tripDuration.temples must be positive");
    check(t.tripDuration.days > 0, "tripDuration.days must be positive");
    check(t.tripDuration.km > 0, "tripDuration.km must be positive");
  }

  return issues;
}

export interface ValidationReport {
  ok: boolean;
  issues: Record<string, string[]>;
  duplicateIds: string[];
}

export function validateTemples(temples: Temple[]): ValidationReport {
  const issues: Record<string, string[]> = {};
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const t of temples) {
    if (seen.has(t.id)) duplicates.add(t.id);
    seen.add(t.id);
    const problems = validateTemple(t);
    if (problems.length) issues[t.id || "(missing id)"] = problems;
  }

  return {
    ok: Object.keys(issues).length === 0 && duplicates.size === 0,
    issues,
    duplicateIds: [...duplicates],
  };
}
