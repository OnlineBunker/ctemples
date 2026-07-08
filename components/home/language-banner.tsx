"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "ctemples:lang-banner-dismissed-at";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Homepage-only, dismissible language-availability strip (UX_SPEC §5.3).
 * SSR-safe: renders nothing on the server / before hydration, then reveals
 * unless dismissed within the last 30 days. The dismissal persists in
 * localStorage. Sits above the sticky header (mounted in the root layout).
 */
export function LanguageBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setVisible(false);
      return;
    }
    let dismissed = false;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const at = Number(raw);
        dismissed = Number.isFinite(at) && Date.now() - at < THIRTY_DAYS_MS;
      }
    } catch {
      // localStorage unavailable (private mode, disabled) — just show the banner.
    }
    setVisible(!dismissed);
  }, [pathname]);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // No-op: dismissal simply won't persist across sessions.
    }
  }

  if (!visible) return null;

  return (
    <div className="border-b border-warm-gold/25 bg-warm-gold-soft/60 text-ink">
      <div className="shell flex items-center justify-between gap-4 py-2">
        <p className="text-sm leading-snug text-ink/80">
          Available in 8 Indian languages — coming soon.{" "}
          <Link
            href="/contact"
            className="font-medium text-temple-red underline-offset-2 hover:underline"
          >
            Notify me →
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss language announcement"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-warm-gold/15 hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
