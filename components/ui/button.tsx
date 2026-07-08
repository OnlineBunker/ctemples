import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Button / ButtonLink — "Modern Utsavam" pills.
 *  - primary:     the signature magenta→coral gradient (the one CTA per surface)
 *  - secondary:   white pill, plum text, hairline border (outline is a legacy alias)
 *  - tertiary:    ghost, magenta text (ghost is a legacy alias)
 *  - warm:        saffron fill with plum text
 *  - destructive: true-red fill (real destructive actions only)
 * Focus ring comes from the global :focus-visible rule (2px magenta, 2px offset).
 */
type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "tertiary"
  | "ghost"
  | "warm"
  | "destructive";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold leading-none transition-[transform,background-color,box-shadow,border-color,color] duration-200 ease-threshold active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Gradient runs magenta -> coral-deep (not coral) so white label text clears WCAG AA
  // 4.5:1 across the whole span (coral's default is ~3.4:1 with white — fails). Hover
  // darkens (brightness-95), matching the design system's "hover = deeper variant"
  // convention elsewhere — lightening the gradient on hover would drop contrast further.
  primary:
    "bg-gradient-to-r from-magenta to-coral-deep text-white shadow-md hover:shadow-lg hover:brightness-95",
  secondary:
    "border border-line-strong bg-canvas text-plum hover:border-magenta hover:text-magenta",
  outline:
    "border border-line-strong bg-canvas text-plum hover:border-magenta hover:text-magenta",
  tertiary: "text-magenta hover:bg-magenta-soft",
  ghost: "text-magenta hover:bg-magenta-soft",
  warm: "bg-saffron text-plum hover:bg-saffron-deep hover:text-white",
  destructive: "bg-danger text-white hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.95rem]",
  lg: "h-[3.25rem] px-8 text-base",
};

function classes(variant: Variant, size: Size, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: { variant?: Variant; size?: Size } & ComponentPropsWithoutRef<"button">) {
  return <button className={classes(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">) {
  return (
    <Link href={href} className={classes(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
