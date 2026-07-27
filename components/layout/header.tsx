"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, ChevronDown, Globe, Check } from "lucide-react";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { PopoverShell } from "@/components/ui/popover-shell";
import { cn } from "@/lib/utils";

/** Explore ▾ presets — real, resolvable list-mode filter URLs (docs/02 §2). The old
 *  `?preset=`/unconditional `?view=map` params are retired (D4, docs/02 §3.6). */
const EXPLORE_ITEMS = [
  { key: "all", label: "All temples", href: "/explore" },
  { key: "states", label: "Browse by state", href: "/states" },
  { key: "deities", label: "Browse by deity", href: "/deities" },
  { key: "popular", label: "Most visited", href: "/explore?sort=popularity" },
];

const LANGUAGES = [
  { code: "EN", label: "English", current: true },
  { code: "HI", label: "हिन्दी" },
  { code: "TA", label: "தமிழ்" },
  { code: "TE", label: "తెలుగు" },
  { code: "KN", label: "ಕನ್ನಡ" },
  { code: "ML", label: "മലയാളം" },
  { code: "BN", label: "বাংলা" },
  { code: "MR", label: "मराठी" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

const navTrigger =
  "relative inline-flex items-center gap-1 rounded-full px-4 py-2 font-mono text-[0.7rem] uppercase tracking-label transition-colors";

// The active-nav "lintel" — a thin magenta threshold under the current section (docs/15
// §4). A small doorway on the chrome; the arch itself stays reserved for imagery.
const navLintel =
  "after:absolute after:left-4 after:right-4 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-magenta after:content-['']";

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-canvas-soft hover:text-magenta";

type MenuItem = {
  key: string;
  label: ReactNode;
  href?: string;
  disabled?: boolean;
  current?: boolean;
  note?: string;
};

const menuItemBase = "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm";
const menuItemInteractive = "text-ink transition-colors hover:bg-magenta-soft focus:bg-magenta-soft focus:outline-none";

/** A single dropdown item — a real Link for a real destination, a disabled note-only row
 *  for the not-yet-available languages. Every interactive row is wrapped in `Popover.Close`
 *  so selecting it dismisses the panel (docs/03 §6.4's behavior contract), without the
 *  hand-rolled pathname-effect the old implementation needed for the same result. */
function DropdownItem({ item }: { item: MenuItem }) {
  const content = (
    <>
      <span className="flex items-center gap-2">
        {item.label}
        {item.current ? <Check className="h-4 w-4 text-magenta" aria-hidden /> : null}
      </span>
      {item.note ? (
        <span className="font-mono text-[0.6rem] uppercase tracking-label text-ink-muted">{item.note}</span>
      ) : null}
    </>
  );

  if (item.disabled) {
    return (
      <button
        type="button"
        aria-disabled="true"
        aria-current={item.current ? "true" : undefined}
        className={cn(menuItemBase, "cursor-default text-ink-muted")}
      >
        {content}
      </button>
    );
  }

  if (item.href) {
    return (
      <Popover.Close asChild>
        <Link
          href={item.href}
          aria-current={item.current ? "page" : undefined}
          className={cn(menuItemBase, menuItemInteractive)}
        >
          {content}
        </Link>
      </Popover.Close>
    );
  }

  return (
    <Popover.Close asChild>
      <button type="button" aria-current={item.current ? "true" : undefined} className={cn(menuItemBase, menuItemInteractive)}>
        {content}
      </button>
    </Popover.Close>
  );
}

/** Header nav dropdown (Explore presets, Language) on the shared Radix Popover shell
 *  (docs/03 §6.4, D19) — focus-in-on-open, Tab-trap, Esc-close-and-restore, and
 *  outside-pointer-dismiss all come from Radix, not hand-rolled. */
function Dropdown({
  items,
  align = "start",
  panelLabel,
  trigger,
}: {
  items: MenuItem[];
  align?: "start" | "end";
  panelLabel: string;
  trigger: ReactNode;
}) {
  return (
    <PopoverShell trigger={trigger} panelLabel={panelLabel} align={align} className="w-auto min-w-[13rem] p-1.5">
      {items.map((item) => (
        <DropdownItem key={item.key} item={item} />
      ))}
    </PopoverShell>
  );
}

/** Full-screen mobile navigation sheet. Traps focus, closes on Esc, and
 *  restores focus to the trigger on close. */
function MobileSheet({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    function onKey(e: KeyboardEvent) {
      const el = panelRef.current;
      if (!el) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusables = Array.from(
          el.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sheetLink =
    "block rounded-lg px-3 py-3 text-base text-ink transition-colors hover:bg-turmeric-soft";

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[60] flex flex-col bg-canvas md:hidden"
      initial={{ opacity: 0, y: reduce ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -8 }}
      transition={{ duration: reduce ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="shell flex h-16 items-center justify-between border-b border-saffron/25">
        <Link href="/" onClick={onClose} className="flex items-center gap-2.5" aria-label="CTemples home">
          <GopuramMark className="h-7 w-7 text-magenta" />
          <span className="font-display text-lg text-ink">
            C<span className="text-magenta">temples</span>
          </span>
        </Link>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          aria-label="Close menu"
          className={iconButton}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <nav aria-label="Primary" className="shell flex-1 overflow-y-auto py-6">
        <div>
          <button
            type="button"
            aria-expanded={exploreOpen}
            aria-controls="m-explore"
            onClick={() => setExploreOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base text-ink transition-colors hover:bg-turmeric-soft"
          >
            Explore
            <ChevronDown
              className={cn("h-5 w-5 transition-transform", exploreOpen && "rotate-180")}
              aria-hidden
            />
          </button>
          {exploreOpen ? (
            <ul id="m-explore" className="ml-3 border-l border-line pl-3">
              {EXPLORE_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} onClick={onClose} className={sheetLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <Link href="/about" onClick={onClose} className={sheetLink}>
          About
        </Link>
        <Link href="/explore" onClick={onClose} className={sheetLink}>
          Search temples
        </Link>

        <div className="mt-6 border-t border-line pt-4">
          <p className="px-3 pb-1 font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
            Language
          </p>
          <ul>
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  aria-disabled={lang.current ? undefined : true}
                  aria-current={lang.current ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    lang.current
                      ? "text-ink hover:bg-turmeric-soft"
                      : "cursor-default text-ink-muted",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {lang.label}
                    {lang.current ? (
                      <Check className="h-4 w-4 text-magenta" aria-hidden />
                    ) : null}
                  </span>
                  {lang.current ? null : (
                    <span className="font-mono text-[0.6rem] uppercase tracking-label text-ink-muted">
                      Coming soon
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </motion.div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Close the mobile sheet on route change.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const exploreActive = isActive(pathname, "/explore");
  const aboutActive = isActive(pathname, "/about");

  const languageItems: MenuItem[] = LANGUAGES.map((lang) => ({
    key: lang.code,
    label: lang.label,
    current: lang.current,
    disabled: !lang.current,
    note: lang.current ? undefined : "Coming soon",
  }));

  return (
    <header
      className="sticky top-0 z-50 border-b border-saffron/25 bg-canvas/90 backdrop-blur-md"
      style={{ viewTransitionName: "site-header" } as CSSProperties}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="CTemples home">
            <GopuramMark className="h-7 w-7 text-magenta transition-transform duration-500 ease-threshold group-hover:-translate-y-0.5" />
            <span className="font-display text-lg tracking-tight text-ink">
              C<span className="text-magenta">temples</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            <Dropdown
              panelLabel="Explore presets"
              items={EXPLORE_ITEMS}
              trigger={
                <button
                  type="button"
                  aria-label="Explore"
                  className={cn(navTrigger, exploreActive ? cn("text-magenta", navLintel) : "text-ink-muted hover:text-ink")}
                >
                  Explore
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </button>
              }
            />
            <Link
              href="/about"
              aria-current={aboutActive ? "page" : undefined}
              className={cn(
                navTrigger,
                aboutActive ? cn("text-magenta", navLintel) : "text-ink-muted hover:text-ink",
              )}
            >
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <SearchOverlay />

          <div className="hidden md:block">
            <Dropdown
              panelLabel="Choose language"
              items={languageItems}
              align="end"
              trigger={
                <button
                  type="button"
                  aria-label="Language: English"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-3 font-mono text-[0.7rem] uppercase tracking-label text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  <Globe className="h-4 w-4" aria-hidden />
                  EN
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </button>
              }
            />
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button
              ref={hamburgerRef}
              type="button"
              className={cn(iconButton, "border border-line")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <MobileSheet
            key="mobile-menu"
            onClose={() => {
              setMenuOpen(false);
              hamburgerRef.current?.focus();
            }}
          />
        ) : null}
      </AnimatePresence>
    </header>
  );
}
