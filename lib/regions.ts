import type { Region } from "./types";

/**
 * Regional "pigment box" — each of India's six regions owns one hue from the
 * "Modern Utsavam" palette (see DESIGN.md). Colour reinforces region on cards and
 * chips; icon + label lead (DESIGN_SYSTEM §1.4). Hexes mirror the `region-*` tokens.
 */
export interface RegionMeta {
  region: Region;
  label: string;
  /** Hex pigment, mirrors the `region-*` tokens in tailwind.config.ts. */
  pigment: string;
  /** Tailwind `region-*` token stem, e.g. "north" -> text-region-north. */
  token: string;
  blurb: string;
}

export const REGION_ORDER: Region[] = [
  "North",
  "South",
  "East",
  "West",
  "Northeast",
  "Central",
];

export const REGION_META: Record<Region, RegionMeta> = {
  North: {
    region: "North",
    label: "North",
    pigment: "#7A2C9E",
    token: "north",
    blurb: "Himalayan shrines, Ganga ghats, and the shikhara-crowned temples of the plains.",
  },
  South: {
    region: "South",
    label: "South",
    pigment: "#E5006D",
    token: "south",
    blurb: "Towering gopurams, granite mandapams, and living Dravidian ritual.",
  },
  East: {
    region: "East",
    label: "East",
    pigment: "#FF7A00",
    token: "east",
    blurb: "The Kalinga spires of Odisha and the Shakta seats of Bengal and Assam.",
  },
  West: {
    region: "West",
    label: "West",
    pigment: "#FF3D6E",
    token: "west",
    blurb: "Marble Jain shrines, sun temples, and the coastal seats of the Deccan.",
  },
  Northeast: {
    region: "Northeast",
    label: "Northeast",
    pigment: "#E0AB00",
    token: "northeast",
    blurb: "Hill temples and tantric power-seats wrapped in cloud forest.",
  },
  Central: {
    region: "Central",
    label: "Central",
    pigment: "#3D0A40",
    token: "central",
    blurb: "The sculpted sandstone of Khajuraho and the temple-forts of the heartland.",
  },
};

export function regionPigment(region: Region): string {
  return REGION_META[region].pigment;
}

/**
 * SVG path data (24x24 viewBox) for each region's icon — mountain, wave, sun, leaf,
 * star, mandala, per DESIGN_SYSTEM_V2 §1.4. Icon + label lead region identity; colour
 * reinforces (see REGION_META). Pure data, consumed by a future RegionIcon component
 * (Phase 4's map region pills) the same way components/brand/deity-icons.tsx consumes
 * lib/deities.ts's icon keys.
 */
export const REGION_ICON_PATHS: Record<Region, string> = {
  // Mountain — a simple twin-peak silhouette.
  North: "M2 20 L9 8 L13 14 L16 9 L22 20 Z",
  // Wave — two stacked crests.
  South: "M2 15 Q6 11 10 15 T18 15 T22 15 M2 20 Q6 16 10 20 T18 20 T22 20",
  // Sun — disc with radiating rays.
  East: "M12 6 A6 6 0 1 1 11.99 6 Z M12 1 V3 M12 21 V23 M1 12 H3 M21 12 H23 M4.2 4.2 L5.6 5.6 M18.4 18.4 L19.8 19.8 M4.2 19.8 L5.6 18.4 M18.4 5.6 L19.8 4.2",
  // Leaf — a single simple leaf with a center vein.
  West: "M4 20 C4 10 12 3 21 3 C21 12 14 20 4 20 Z M4 20 L14 10",
  // Star — a five-point outline.
  Northeast: "M12 2 L14.6 9 L22 9.3 L16.2 14 L18.2 21 L12 17 L5.8 21 L7.8 14 L2 9.3 L9.4 9 Z",
  // Mandala — concentric rings + petals, echoing the brand's kolam motif at small size.
  Central: "M12 12 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M12 12 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M12 3 V5 M12 19 V21 M3 12 H5 M19 12 H21",
};

export function regionIconPath(region: Region): string {
  return REGION_ICON_PATHS[region];
}

/**
 * Every one of the 36 states/UTs' cultural region (docs/07 §3's region pills, D9) — a
 * fixed geographic fact, unlike `Temple.region` (hand-set per record). Zero-temple
 * states still need a region for the map's region-pill dimming to work at all 36, not
 * just the ones with data. Consistent with every temple record's own `region` field for
 * the 12 states currently in data/temples.ts (this is not derived from it — a state's
 * region can't depend on whether it happens to have a temple yet).
 */
export const STATE_REGION: Record<string, Region> = {
  "Jammu and Kashmir": "North",
  Ladakh: "North",
  "Himachal Pradesh": "North",
  Punjab: "North",
  Haryana: "North",
  Delhi: "North",
  Uttarakhand: "North",
  Chandigarh: "North",
  "Uttar Pradesh": "North",

  "Tamil Nadu": "South",
  Kerala: "South",
  Karnataka: "South",
  "Andhra Pradesh": "South",
  Telangana: "South",
  Puducherry: "South",
  Lakshadweep: "South",

  Odisha: "East",
  "West Bengal": "East",
  Jharkhand: "East",
  Bihar: "East",
  "Andaman and Nicobar Islands": "East",

  Gujarat: "West",
  Maharashtra: "West",
  Rajasthan: "West",
  Goa: "West",
  "Dadra and Nagar Haveli and Daman and Diu": "West",

  Assam: "Northeast",
  "Arunachal Pradesh": "Northeast",
  Meghalaya: "Northeast",
  Manipur: "Northeast",
  Mizoram: "Northeast",
  Nagaland: "Northeast",
  Tripura: "Northeast",
  Sikkim: "Northeast",

  "Madhya Pradesh": "Central",
  Chhattisgarh: "Central",
};

export function regionForState(stateName: string): Region | undefined {
  return STATE_REGION[stateName];
}
