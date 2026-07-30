"use client";

import Link from "next/link";
import { padCount } from "@/lib/format";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { GopuramMark } from "@/components/brand/gopuram-mark";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { WishlistLink } from "@/components/layout/wishlist-link";
import { cn } from "@/lib/utils";

/**
 * Site header — prototype fidelity (docs/15 §0a):
 * - Desktop nav: EXPLORE / ABOUT / METHODOLOGY / SUGGEST in Space Mono small caps;
 *   the active route is magenta with a 1.5px bottom border. Search + wishlist pills at right.
 * - On the homepage the header floats fixed and transparent over the dark Threshold
 *   hero (cream text), gaining a blurred plum background after ~40px of scroll.
 *   Everywhere else: sticky, blurred cream, hairline bottom border.
 * - Mobile: hamburger opens a full-screen plum takeover with big numbered links
 *   (focus-trapped, Esc closes and restores focus).
 */
const NAV = [
  { label: "EXPLORE", href: "/explore" },
  { label: "ABOUT", href: "/about" },
  { label: "METHODOLOGY", href: "/methodology" },
  { label: "SUGGEST", href: "/suggest" },
];

const MENU = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "About", href: "/about" },
  { label: "Methodology", href: "/methodology" },
  { label: "Suggest a temple", href: "/suggest" },
  { label: "Your wishlist", href: "/wishlist" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Full-screen plum mobile menu takeover. Traps focus, closes on Esc. */
function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
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
          el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
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

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[400] flex flex-col bg-surface-deep text-porcelain md:hidden"
      initial={{ opacity: reduce ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: reduce ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 0.25 }}
    >
      <div className="flex items-center justify-between px-5 py-[15px]">
        <span className="font-display text-[19px] font-bold">CTemples</span>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          aria-label="Close menu"
          className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-porcelain/25 text-porcelain"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <nav aria-label="Primary" className="flex flex-1 flex-col justify-center gap-1 px-6">
        {MENU.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className={cn(
              "flex items-baseline gap-4 border-b border-porcelain/10 py-2.5 transition-colors hover:text-turmeric",
              isActive(pathname, item.href) ? "text-turmeric" : "text-porcelain",
            )}
          >
            <span className="font-mono text-[11px] text-coral">{padCount(i + 1)}</span>
            <span className="font-display text-[clamp(28px,7vw,44px)] font-bold tracking-[-.02em]">{item.label}</span>
          </Link>
        ))}
      </nav>
      <p className="px-6 py-[22px] font-mono text-[10px] tracking-[.24em] text-porcelain-muted">
        A FIELD GUIDE TO SACRED INDIA
      </p>
    </motion.div>
  );
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Homepage: transparent over the hero → blurred plum after 40px.
  useEffect(() => {
    if (!isHome) return;
    // rAF-gated, and only commits state when the boolean actually flips — this listener is
    // mounted on the homepage where the parallax rig is already doing per-frame work, so an
    // unthrottled setState on every scroll event was the one avoidable re-render in that path.
    let raf = 0;
    let queued = false;
    const measure = () => {
      queued = false;
      const next = window.scrollY > 40;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isHome]);

  const dark = isHome; // cream text over the dark hero
  const navLink = (href: string, label: string) => {
    const active = isActive(pathname, href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "border-b-[1.5px] py-1.5 font-mono text-[11px] tracking-[.2em] transition-colors",
          dark
            ? "border-transparent text-porcelain/60 hover:text-turmeric"
            : active
              ? "border-magenta text-magenta-deep"
              : "border-transparent text-ink/70 hover:text-magenta",
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <header
        className={cn(
          "left-0 right-0 top-0",
          isHome
            ? cn("fixed z-[120] transition-[background-color,box-shadow] duration-300", scrolled && "backdrop-blur-md")
            : "sticky z-50 border-b border-ink/10 bg-porcelain/90 backdrop-blur-md",
        )}
        style={
          {
            viewTransitionName: "site-header",
            ...(isHome
              ? {
                  background: scrolled ? "rgba(36,16,33,.9)" : "transparent",
                  boxShadow: scrolled ? "0 1px 0 rgba(251,246,240,.12)" : "none",
                }
              : {}),
          } as CSSProperties
        }
      >
        <div className="flex items-center justify-between gap-4 px-5 py-[15px] sm:px-8 lg:px-12 xl:px-[clamp(20px,6vw,110px)]">
          <Link
            href="/"
            aria-label="CTemples home"
            className={cn("flex items-center gap-2.5", dark ? "text-porcelain" : "text-ink")}
          >
            <GopuramMark className="h-7 w-6 text-magenta" strokeWidth={2} />
            <span className="font-display text-[19px] font-bold tracking-[-.02em]">CTemples</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-[clamp(14px,2.4vw,30px)] md:flex">
            {isHome ? (
              <a
                href="#index"
                className="border-b-[1.5px] border-transparent py-1.5 font-mono text-[11px] tracking-[.2em] text-porcelain/60 transition-colors hover:text-turmeric"
              >
                THE INDEX ↓
              </a>
            ) : null}
            {NAV.filter((n) => !isHome || n.href === "/explore" || n.href === "/about").map((n) =>
              navLink(n.href, n.label),
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            <SearchOverlay tone={dark ? "dark" : "light"} />
            <WishlistLink tone={dark ? "dark" : "light"} />
            <button
              ref={hamburgerRef}
              type="button"
              aria-expanded={menuOpen}
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className={cn(
                "inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border md:hidden",
                dark ? "border-porcelain/30 text-porcelain" : "border-ink/20 text-ink",
              )}
            >
              <Menu className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <MobileMenu
            key="mobile-menu"
            pathname={pathname}
            onClose={() => {
              setMenuOpen(false);
              hamburgerRef.current?.focus();
            }}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
