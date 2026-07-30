import { describe, it, expect } from "vitest";
import {
  parseExploreParams,
  buildExploreHref,
  buildViewHref,
  withQuery,
  type ParsedExploreParams,
} from "./explore-url";

const BASE: ParsedExploreParams = {
  view: "list",
  q: "",
  exact: false,
  state: undefined,
  deity: undefined,
  tags: [],
  sort: "rating",
  page: 1,
};

describe("parseExploreParams", () => {
  it("defaults to list/rating/page-1 with no params", () => {
    expect(parseExploreParams({})).toEqual(BASE);
  });

  it("parses view=map only when exactly 'map'", () => {
    expect(parseExploreParams({ view: "map" }).view).toBe("map");
    expect(parseExploreParams({ view: "banana" }).view).toBe("list");
  });

  it("coerces legacy sort values", () => {
    expect(parseExploreParams({ sort: "featured" }).sort).toBe("rating");
    expect(parseExploreParams({ sort: "cost" }).sort).toBe("rating");
    expect(parseExploreParams({ sort: "alpha" }).sort).toBe("name");
    expect(parseExploreParams({ sort: "garbage" }).sort).toBe("rating");
    expect(parseExploreParams({ sort: "popularity" }).sort).toBe("popularity");
  });

  it("ignores an invalid deity", () => {
    expect(parseExploreParams({ deity: "shiva" }).deity).toBe("shiva");
    expect(parseExploreParams({ deity: "zeus" }).deity).toBeUndefined();
  });

  it("caps tags at 3 and dedupes", () => {
    const parsed = parseExploreParams({ tag: ["a", "b", "a", "c", "d"] });
    expect(parsed.tags).toEqual(["a", "b", "c"]);
  });

  it("clamps page to >= 1 and ignores non-numeric", () => {
    expect(parseExploreParams({ page: "0" }).page).toBe(1);
    expect(parseExploreParams({ page: "-5" }).page).toBe(1);
    expect(parseExploreParams({ page: "banana" }).page).toBe(1);
    expect(parseExploreParams({ page: "3" }).page).toBe(3);
  });

  it("only sets exact when '1'", () => {
    expect(parseExploreParams({ q: "shiva", exact: "1" }).exact).toBe(true);
    expect(parseExploreParams({ q: "shiva", exact: "true" }).exact).toBe(false);
  });
});

describe("buildExploreHref", () => {
  it("returns bare /explore for all-default params", () => {
    expect(buildExploreHref(BASE)).toBe("/explore");
  });

  it("alphabetizes tags regardless of input order", () => {
    const href = buildExploreHref(BASE, { tags: ["unesco", "dravidian", "pilgrimage"] });
    expect(href).toBe("/explore?tag=dravidian&tag=pilgrimage&tag=unesco");
  });

  it("drops default sort/page, keeps non-defaults", () => {
    expect(buildExploreHref(BASE, { sort: "rating", page: 1 })).toBe("/explore");
    expect(buildExploreHref(BASE, { sort: "name", page: 2 })).toBe("/explore?sort=name&page=2");
  });

  it("only includes exact alongside a non-empty q", () => {
    expect(buildExploreHref(BASE, { exact: true })).toBe("/explore");
    expect(buildExploreHref(BASE, { q: "mahadev", exact: true })).toBe("/explore?q=mahadev&exact=1");
  });

  it("includes view=map only for map, never for list", () => {
    expect(buildExploreHref(BASE, { view: "map" })).toBe("/explore?view=map");
    expect(buildExploreHref({ ...BASE, view: "map" }, { view: "list" })).toBe("/explore");
  });

  it("round-trips: parse(build(params)) === params", () => {
    const params: ParsedExploreParams = {
      view: "list",
      q: "shiva",
      exact: true,
      state: "tamil-nadu",
      deity: "shiva",
      tags: ["unesco", "pilgrimage"],
      sort: "name",
      page: 2,
    };
    const href = buildExploreHref(BASE, params);
    const qs = href.split("?")[1] ?? "";
    const sp: Record<string, string | string[]> = {};
    new URLSearchParams(qs).forEach((value, key) => {
      if (sp[key] === undefined) sp[key] = value;
      else sp[key] = [...(Array.isArray(sp[key]) ? sp[key] : [sp[key] as string]), value];
    });
    expect(parseExploreParams(sp)).toEqual({ ...params, tags: ["pilgrimage", "unesco"] });
  });
});

describe("withQuery", () => {
  it("resets page to 1 and preserves exact when q is non-empty", () => {
    const withExact = withQuery({ ...BASE, page: 3, exact: true }, "shiva");
    expect(withExact).toMatchObject({ q: "shiva", exact: true, page: 1 });
  });
  it("clears exact when q becomes empty", () => {
    const cleared = withQuery({ ...BASE, q: "shiva", exact: true }, "");
    expect(cleared).toMatchObject({ q: "", exact: false });
  });
});

describe("near (geolocation) + nearest sort", () => {
  it("parses a valid near pair", () => {
    expect(parseExploreParams({ near: "12.972,77.594" }).near).toEqual({ lat: 12.972, lng: 77.594 });
    expect(parseExploreParams({ near: "-33.87,151.21" }).near).toEqual({ lat: -33.87, lng: 151.21 });
  });

  it("rejects malformed or out-of-range coordinates", () => {
    for (const bad of ["", "12.972", "a,b", "12,34,56", "91,0", "0,181", "NaN,5"]) {
      expect(parseExploreParams({ near: bad }).near).toBeUndefined();
    }
  });

  it("keeps sort=nearest only when coordinates are present", () => {
    expect(parseExploreParams({ sort: "nearest", near: "12.9,77.6" }).sort).toBe("nearest");
    // Unsatisfiable without a reference point — falls back to the default ordering.
    expect(parseExploreParams({ sort: "nearest" }).sort).toBe("rating");
  });

  it("round-trips near through build -> parse at 3dp", () => {
    const href = buildExploreHref(BASE, { near: { lat: 12.97159, lng: 77.59457 }, sort: "nearest" });
    expect(href).toContain("near=12.972%2C77.595");
    const sp = Object.fromEntries(new URLSearchParams(href.split("?")[1]));
    const parsed = parseExploreParams(sp);
    expect(parsed.sort).toBe("nearest");
    expect(parsed.near).toEqual({ lat: 12.972, lng: 77.595 });
  });

  it("never writes sort=nearest without coordinates", () => {
    expect(buildExploreHref(BASE, { sort: "nearest" })).toBe("/explore");
  });
});

describe("buildViewHref", () => {
  const FILTERED: ParsedExploreParams = {
    ...BASE,
    q: "shiva",
    exact: true,
    state: "tamil-nadu",
    deity: "shiva",
    tags: ["pilgrimage"],
    sort: "name",
    page: 4,
  };

  it("drops every filter when switching view (list and map never share filters)", () => {
    expect(buildViewHref(FILTERED, "map")).toBe("/explore?view=map");
    expect(buildViewHref({ ...FILTERED, view: "map" }, "list")).toBe("/explore");
  });

  it("carries the visitor's location across, since it is a personalisation not a filter", () => {
    const near = { lat: 12.972, lng: 77.595 };
    expect(buildViewHref({ ...FILTERED, near }, "list")).toBe("/explore?sort=nearest&near=12.972%2C77.595");
    // Map mode is state-driven, so it does not adopt the distance ordering.
    expect(buildViewHref({ ...FILTERED, near }, "map")).toBe("/explore?view=map&near=12.972%2C77.595");
  });
});
