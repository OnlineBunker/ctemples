"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, Loader2 } from "lucide-react";
import { buildExploreHref, formatNearParam, type ParsedExploreParams } from "@/lib/explore-url";
import type { LatLng } from "@/lib/distance";

/**
 * "Nearest you" (owner directive 2026-07-30) — replaces the old manual "Pick your state for
 * local results" dropdown, which asked the visitor to choose a state that the State filter
 * already covers, and which only ever re-ordered by a coarse state match.
 *
 * This asks the browser for the visitor's real coordinates and hands them to the server as
 * `?near=lat,lng&sort=nearest`, so results are genuinely ordered by great-circle distance and
 * every card can state how far away it is.
 *
 * Behaviour:
 *  • Coordinates are cached in `localStorage` for 7 days, so return visits apply instantly
 *    with no prompt and no flash of un-sorted results.
 *  • A cached fix (or an already-granted permission) is applied automatically via
 *    `router.replace` — it replaces rather than pushes, so Back still leaves Explore.
 *  • Auto-apply is skipped whenever the visitor is doing something deliberate (a search, a
 *    filter, page 2+, a hand-picked sort) — it would fight their intent.
 *  • If they decline, or the device can't report a position, NOTHING is rendered — no dead
 *    control, no second way to pick a location.
 */
const COORDS_KEY = "ctemples:geo";
const DECLINED_KEY = "ctemples:geo-declined";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type Phase = "idle" | "asking" | "active" | "unavailable";

interface CachedFix {
  lat: number;
  lng: number;
  at: number;
}

function readCache(): LatLng | null {
  try {
    const raw = window.localStorage.getItem(COORDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedFix>;
    if (typeof parsed?.lat !== "number" || typeof parsed?.lng !== "number") return null;
    if (typeof parsed.at !== "number" || Date.now() - parsed.at > MAX_AGE_MS) return null;
    return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    return null;
  }
}

function writeCache(fix: LatLng) {
  try {
    window.localStorage.setItem(COORDS_KEY, JSON.stringify({ ...fix, at: Date.now() }));
  } catch {
    // Not persisted — this visit still works.
  }
}

function hasDeclined(): boolean {
  try {
    return window.localStorage.getItem(DECLINED_KEY) === "1";
  } catch {
    return false;
  }
}

function setDeclined() {
  try {
    window.localStorage.setItem(DECLINED_KEY, "1");
  } catch {
    // no-op
  }
}

export function NearbyLocator({ current }: { current: ParsedExploreParams }) {
  const router = useRouter();
  const active = current.sort === "nearest" && Boolean(current.near);
  const [phase, setPhase] = useState<Phase>(active ? "active" : "idle");

  // Only auto-apply on a "clean" browse — never over a deliberate query/filter/page/sort.
  const isCleanBrowse =
    !current.q && !current.state && !current.deity && current.tags.length === 0 && current.page === 1;

  const apply = useCallback(
    (fix: LatLng, mode: "replace" | "push") => {
      const href = buildExploreHref(current, { near: fix, sort: "nearest", page: 1 });
      if (mode === "replace") router.replace(href);
      else router.push(href);
    },
    [current, router],
  );

  const request = useCallback(
    (mode: "replace" | "push") => {
      if (!("geolocation" in navigator)) {
        setPhase("unavailable");
        return;
      }
      setPhase("asking");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const fix = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          writeCache(fix);
          setPhase("active");
          apply(fix, mode);
        },
        () => {
          // Denied, unavailable, or timed out — remember it and show nothing further.
          setDeclined();
          setPhase("unavailable");
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: MAX_AGE_MS },
      );
    },
    [apply],
  );

  useEffect(() => {
    if (active || !isCleanBrowse) return;

    // 1) A cached fix applies immediately — no prompt, no waiting.
    const cached = readCache();
    if (cached) {
      apply(cached, "replace");
      return;
    }
    if (hasDeclined() || !("geolocation" in navigator)) {
      setPhase("unavailable");
      return;
    }

    // 2) Permission already granted in a previous session → fetch silently.
    //    Otherwise surface a one-tap control instead of a cold, unexplained prompt.
    const permissions = navigator.permissions;
    if (!permissions?.query) {
      setPhase("idle");
      return;
    }
    let cancelled = false;
    permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (cancelled) return;
        if (status.state === "granted") request("replace");
        else if (status.state === "denied") setPhase("unavailable");
        else setPhase("idle");
      })
      .catch(() => {
        if (!cancelled) setPhase("idle");
      });
    return () => {
      cancelled = true;
    };
  }, [active, isCleanBrowse, apply, request]);

  if (phase === "unavailable") return null;

  if (active) {
    const cachedNear = current.near ? formatNearParam(current.near) : "";
    return (
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[.16em] text-ink/55">
        <span className="inline-flex items-center gap-1.5 text-magenta-deep">
          <LocateFixed className="h-3.5 w-3.5" aria-hidden />
          Nearest you
        </span>
        <span className="sr-only">Sorted by distance from your location ({cachedNear}).</span>
        <button
          type="button"
          onClick={() => {
            setDeclined();
            router.push(buildExploreHref(current, { near: undefined, sort: "rating", page: 1 }));
          }}
          className="underline-offset-4 transition-colors hover:text-magenta hover:underline"
        >
          Turn off
        </button>
      </p>
    );
  }

  if (phase === "asking") {
    return (
      <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-ink/55">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-magenta" aria-hidden />
        Finding temples near you…
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => request("push")}
      className="inline-flex items-center gap-2 rounded-full border border-ink/[.18] px-[15px] py-2 font-mono text-[10px] uppercase tracking-[.16em] text-ink transition-colors hover:border-magenta hover:text-magenta"
    >
      <LocateFixed className="h-3.5 w-3.5" aria-hidden />
      Temples near me
    </button>
  );
}
