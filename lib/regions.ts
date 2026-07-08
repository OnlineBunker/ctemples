import type { Region } from "./types";

/**
 * Regional "pigment box" — each of India's six regions owns one color drawn from
 * gopuram polychromy (see DESIGN.md). The color is data, not decoration: it codes
 * region on cards, chips, and the map so a hue carries meaning.
 */
export interface RegionMeta {
  region: Region;
  label: string;
  /** Hex pigment, mirrors tailwind.config.ts tokens. */
  pigment: string;
  /** Tailwind text/border/bg token stem, e.g. "lapis" -> text-lapis. */
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
    pigment: "#3E6CC4",
    token: "lapis",
    blurb: "Himalayan shrines, Ganga ghats, and the shikhara-crowned temples of the plains.",
  },
  South: {
    region: "South",
    label: "South",
    pigment: "#E1462F",
    token: "vermilion",
    blurb: "Towering gopurams, granite mandapams, and living Dravidian ritual.",
  },
  East: {
    region: "East",
    label: "East",
    pigment: "#3E9385",
    token: "verdigris",
    blurb: "The Kalinga spires of Odisha and the Shakta seats of Bengal and Assam.",
  },
  West: {
    region: "West",
    label: "West",
    pigment: "#F2A93B",
    token: "marigold",
    blurb: "Marble jain shrines, sun temples, and the coastal seats of the Deccan.",
  },
  Northeast: {
    region: "Northeast",
    label: "Northeast",
    pigment: "#4FA06B",
    token: "jade",
    blurb: "Hill temples and tantric power-seats wrapped in cloud forest.",
  },
  Central: {
    region: "Central",
    label: "Central",
    pigment: "#C9A24B",
    token: "brass",
    blurb: "The sculpted sandstone of Khajuraho and the temple-forts of the heartland.",
  },
};

export function regionPigment(region: Region): string {
  return REGION_META[region].pigment;
}
