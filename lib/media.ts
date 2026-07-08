import type { MediaItem } from "./types";

/** The canonical hero item — the first image (falling back to the first item of any kind). */
export function getHero(media: MediaItem[]): MediaItem | null {
  return media.find((m) => m.kind === "image") ?? media[0] ?? null;
}

/** Every item after the hero, for gallery grids (Phase 7's video-ready lightbox). */
export function getGallery(media: MediaItem[]): MediaItem[] {
  const hero = getHero(media);
  return hero ? media.filter((m) => m !== hero) : media;
}

/** The first video item, if any. None ship in the prototype yet — always null today. */
export function getVideo(media: MediaItem[]): MediaItem | null {
  return media.find((m) => m.kind === "video") ?? null;
}
