export interface Festival {
  name: string;
  timing: string; // e.g. "March/April (Chaitra month)"
  description: string;
}

export interface CostEstimate {
  fromCity: string; // a major hub city
  distanceKm: number;
  travelTime: string; // e.g. "7-8 hrs by road, 1 hr by air"
  budget: string; // e.g. "₹4,000 - ₹6,000 per person"
  midRange: string; // e.g. "₹7,000 - ₹11,000 per person"
  luxury: string; // e.g. "₹15,000+ per person"
}

export interface NearbyAttraction {
  name: string;
  distanceKm: number;
  description: string;
}

/**
 * A single gallery/hero media item. `kind: "video"` is schema-ready for future
 * production video (none ships in the prototype yet — see components/home/hero-slide.tsx
 * for the dormant video-slide branch). `poster` is the still shown before a video plays.
 */
export interface MediaItem {
  kind: "image" | "video";
  url: string;
  poster?: string;
  alt: string;
  width?: number;
  height?: number;
  durationSec?: number;
}

export type Region = "North" | "South" | "East" | "West" | "Northeast" | "Central";

export interface Temple {
  id: string; // url slug
  name: string;
  state: string;
  city: string;
  region: Region;
  religion: string;
  deity: string;
  tagline: string;
  whyVisit: string; // 3-4 editorial sentences — not auto-generated from overview
  // media[0] is always the hero image, per lib/media.ts's getHero() (Phase 7 completed
  // the heroImage/gallery/videoUrl -> media[] migration; the legacy fields are gone).
  media: MediaItem[];
  coordinates: { lat: number; lng: number };
  overview: string;
  history: string; // long-form, \n\n-separated paragraphs
  legendsAndMythology: string;
  architecture: string;
  spiritualSignificance: string;
  quickFacts: {
    built: string;
    dynasty: string;
    architecturalStyle: string;
    presidingDeity: string;
  };
  // Derived slug of quickFacts.architecturalStyle, hand-curated to group temples that
  // share a real architectural tradition (see data/temples.ts) rather than a mechanical
  // per-record slug, which would make every temple its own singleton "style".
  architecturalStyleSlug: string;
  timings: { opening: string; closing: string; notes?: string };
  entryFee: { indian: string; foreign?: string; cameraOrPhoneFee?: string };
  bestTimeToVisit: {
    idealMonths: string;
    idealTimeOfDay: string;
    festivals: Festival[];
  };
  howToReach: { byAir: string; byTrain: string; byRoad: string };
  costEstimates: CostEstimate[]; // 3-4 entries, static ranges (not a live calculator)
  nearbyAttractions: NearbyAttraction[];
  tags: string[];
  rating: number;
  featured: boolean;
  /** Optional "Plan around" summary line; populated for ~6 of 15 temples. */
  tripDuration?: { temples: number; days: number; km: number };
  /**
   * 0–100 ordinal, merged in by lib/temples.ts from data/popularity.json (docs/09 §4,
   * D12) — never rendered as a number, never hand-authored. A lightweight stand-in for
   * the full production `Popularity` object (docs/09 §2, Stage B). Absent (undefined)
   * only if a record has no matching popularity.json entry.
   */
  popularityScore?: number;
}
