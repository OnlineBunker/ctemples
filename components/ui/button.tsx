import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-mono uppercase tracking-label transition-[transform,background-color,border-color,color] duration-200 ease-threshold active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-vermilion text-limewash hover:bg-vermilion-deep shadow-lift",
  outline: "border border-brass/40 text-brass hover:border-brass hover:bg-brass/10",
  ghost: "text-limewash/80 hover:text-limewash",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[0.65rem]",
  md: "px-6 py-3 text-[0.72rem]",
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
