import { describe, it, expect } from "vitest";
import { getHero, getGallery, getVideo } from "./media";
import type { MediaItem } from "./types";

const photo1: MediaItem = { kind: "image", url: "a.jpg", alt: "A" };
const photo2: MediaItem = { kind: "image", url: "b.jpg", alt: "B" };
const video1: MediaItem = { kind: "video", url: "c.mp4", alt: "C", poster: "c-poster.jpg" };

describe("getHero", () => {
  it("returns the first image", () => {
    expect(getHero([photo1, photo2])).toBe(photo1);
  });
  it("skips a leading video to find the first image", () => {
    expect(getHero([video1, photo1])).toBe(photo1);
  });
  it("falls back to the first item if there is no image", () => {
    expect(getHero([video1])).toBe(video1);
  });
  it("returns null for an empty list", () => {
    expect(getHero([])).toBeNull();
  });
});

describe("getGallery", () => {
  it("returns every item except the hero", () => {
    expect(getGallery([photo1, photo2, video1])).toEqual([photo2, video1]);
  });
  it("returns everything when there is no hero", () => {
    expect(getGallery([])).toEqual([]);
  });
});

describe("getVideo", () => {
  it("returns the first video item", () => {
    expect(getVideo([photo1, video1])).toBe(video1);
  });
  it("returns null when there is no video", () => {
    expect(getVideo([photo1, photo2])).toBeNull();
  });
});
