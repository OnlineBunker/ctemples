"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, type CSSProperties, type ReactNode, type MouseEvent } from "react";
import { addTransitionType } from "./view-transition";

/**
 * A Link that tags its navigation with a view-transition type so pages can slide
 * directionally (nav-forward / nav-back) and shared elements can morph. Falls back to
 * a normal navigation if the experimental type API isn't present, and always lets
 * modifier/middle clicks open a new tab. Real anchor underneath → fully keyboard-usable.
 */
export function TransitionLink({
  href,
  type = "nav-forward",
  children,
  className,
  style,
  prefetch,
  onClick,
  "aria-label": ariaLabel,
  id,
  role,
  tabIndex,
  "aria-selected": ariaSelected,
}: {
  href: string;
  type?: "nav-forward" | "nav-back";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  prefetch?: boolean;
  /** Optional side-effect (e.g. closing an overlay) — runs before the tagged navigation. */
  onClick?: () => void;
  "aria-label"?: string;
  /** ARIA passthrough, for links that are also listbox options (the search overlay's rows):
   *  the option must BE the anchor, not wrap one, or the listbox has interactive descendants. */
  id?: string;
  role?: string;
  tabIndex?: number;
  "aria-selected"?: boolean;
}) {
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.();
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    startTransition(() => {
      try {
        addTransitionType?.(type);
      } catch {
        /* experimental API unavailable — plain navigation still works */
      }
      router.push(href);
    });
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      style={style}
      prefetch={prefetch}
      aria-label={ariaLabel}
      id={id}
      role={role}
      tabIndex={tabIndex}
      aria-selected={ariaSelected}
    >
      {children}
    </Link>
  );
}
