"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, Search, ChevronDown, Globe, Check } from "lucide-react";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { cn } from "@/lib/utils";

/** Explore ▾ presets. The `?view`/`?preset` params are honoured once Explore
 *  map mode ships (Phase 3/4); until then the old Explore page ignores them. */
const EXPLORE_ITEMS = [
  { key: "all", label: "All temples", href: "/explore" },
  { key: "pilgrimage", label: "Pilgrimage", href: "/explore?view=map&preset=pilgrimage" },
  { key: "architecture", label: "Architecture", href: "/explore?view=map&preset=architecture" },
  { key: "discover", label: "Discover", href: "/explore?view=map&preset=discover" },
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
  "inline-flex items-center gap-1 rounded-full px-4 py-2 font-mono text-[0.7rem] uppercase tracking-label transition-colors";

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-canvas-soft hover:text-temple-red";

type MenuItem = {
  key: string;
  label: ReactNode;
  href?: string;
  disabled?: boolean;
  current?: boolean;
  note?: string;
};

/** Accessible menu-button dropdown: opens on click, closes on Esc (restoring
 *  focus) and outside click, roves with ↑/↓/Home/End, and traps Tab. */
function Dropdown({
  id,
  menuLabel,
  items,
  align = "left",
  triggerClassName,
  triggerAriaLabel,
  children,
}: {
  id: string;
  menuLabel: string;
  items: MenuItem[];
  align?: "left" | "right";
  triggerClassName?: string;
  triggerAriaLabel?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close whenever the route changes (e.g. after selecting a link item).
  useEffect(() => setOpen(false), [pathname]);

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (open) menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  // Dismiss on outside pointer.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function close(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function onMenuKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    const menuEl = menuRef.current;
    if (!menuEl) return;
    const els = Array.from(menuEl.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (!els.length) return;
    const idx = els.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) => els[(i + els.length) % els.length].focus();
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusAt(idx + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusAt(idx - 1);
        break;
      case "Home":
        e.preventDefault();
        focusAt(0);
        break;
      case "End":
        e.preventDefault();
        focusAt(els.length - 1);
        break;
      case "Tab": // trap focus within the menu
        e.preventDefault();
        focusAt(idx + (e.shiftKey ? -1 : 1));
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={triggerAriaLabel}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (!open && e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={triggerClassName}
      >
        {children}
      </button>

      {open ? (
        <div
          id={id}
          ref={menuRef}
          role="menu"
          aria-label={menuLabel}
          onKeyDown={onMenuKeyDown}
          className={cn(
            "absolute z-50 mt-2 min-w-[13rem] rounded-xl border border-line bg-canvas p-1.5 shadow-md",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) =>
            item.href && !item.disabled ? (
              <Link
                key={item.key}
                href={item.href}
                role="menuitem"
                tabIndex={-1}
                aria-current={item.current ? "page" : undefined}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-sand-yellow-soft focus:bg-sand-yellow-soft focus:outline-none"
              >
                {item.label}
                {item.current ? <Check className="h-4 w-4 text-temple-red" aria-hidden /> : null}
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-disabled={item.disabled || undefined}
                aria-current={item.current ? "true" : undefined}
                onClick={() => {
                  if (!item.disabled) close();
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none",
                  item.disabled
                    ? "cursor-default text-ink-subtle"
                    : "text-ink hover:bg-sand-yellow-soft focus:bg-sand-yellow-soft",
                )}
              >
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.current ? <Check className="h-4 w-4 text-temple-red" aria-hidden /> : null}
                </span>
                {item.note ? (
                  <span className="font-mono text-[0.6rem] uppercase tracking-label text-ink-subtle">
                    {item.note}
                  </span>
                ) : null}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
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
    "block rounded-lg px-3 py-3 text-base text-ink transition-colors hover:bg-sand-yellow-soft";

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
      <div className="shell flex h-16 items-center justify-between border-b border-warm-gold/25">
        <Link href="/" onClick={onClose} className="flex items-center gap-2.5" aria-label="CTemples home">
          <GopuramMark className="h-7 w-7 text-temple-red" />
          <span className="font-display text-lg text-ink">
            C<span className="text-temple-red">temples</span>
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
            className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base text-ink transition-colors hover:bg-sand-yellow-soft"
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
          <p className="px-3 pb-1 font-mono text-[0.62rem] uppercase tracking-label text-ink-subtle">
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
                      ? "text-ink hover:bg-sand-yellow-soft"
                      : "cursor-default text-ink-subtle",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {lang.label}
                    {lang.current ? (
                      <Check className="h-4 w-4 text-temple-red" aria-hidden />
                    ) : null}
                  </span>
                  {lang.current ? null : (
                    <span className="font-mono text-[0.6rem] uppercase tracking-label text-ink-subtle">
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
      className="sticky top-0 z-50 border-b border-warm-gold/25 bg-canvas/90 backdrop-blur-md"
      style={{ viewTransitionName: "site-header" } as CSSProperties}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="CTemples home">
            <GopuramMark className="h-7 w-7 text-temple-red transition-transform duration-500 ease-threshold group-hover:-translate-y-0.5" />
            <span className="font-display text-lg tracking-tight text-ink">
              C<span className="text-temple-red">temples</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            <Dropdown
              id="explore-menu"
              menuLabel="Explore presets"
              items={EXPLORE_ITEMS}
              triggerAriaLabel="Explore"
              triggerClassName={cn(
                navTrigger,
                exploreActive ? "text-temple-red" : "text-ink-muted hover:text-ink",
              )}
            >
              Explore
              <ChevronDown className="h-4 w-4" aria-hidden />
            </Dropdown>
            <Link
              href="/about"
              aria-current={aboutActive ? "page" : undefined}
              className={cn(
                navTrigger,
                aboutActive ? "text-temple-red" : "text-ink-muted hover:text-ink",
              )}
            >
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Search: navigates to Explore for now; Phase 6 wires the overlay. */}
          <Link href="/explore" aria-label="Search temples" className={cn(iconButton, "hidden md:inline-flex")}>
            <Search className="h-5 w-5" aria-hidden />
          </Link>

          <div className="hidden md:block">
            <Dropdown
              id="language-menu"
              menuLabel="Choose language"
              items={languageItems}
              align="right"
              triggerAriaLabel="Language: English"
              triggerClassName="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-3 font-mono text-[0.7rem] uppercase tracking-label text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <Globe className="h-4 w-4" aria-hidden />
              EN
              <ChevronDown className="h-4 w-4" aria-hidden />
            </Dropdown>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <Link href="/explore" aria-label="Search temples" className={iconButton}>
              <Search className="h-5 w-5" aria-hidden />
            </Link>
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
