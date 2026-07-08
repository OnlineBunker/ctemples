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
