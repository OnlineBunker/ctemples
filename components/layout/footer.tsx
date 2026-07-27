import Link from "next/link";
import { GopuramMark } from "@/components/brand/gopuram-mark";

/**
 * The footer — the deepest chamber (docs/15 §2B): a `surface-sanctum` plum band that
 * closes every page. Column headers are gold Space Mono; the required attribution
 * (DataMeet map data + Wikimedia imagery) is rendered as a proper imprint; social
 * channels are honest "coming soon" affordances, never dead plain text.
 */
const NAV = {
  Explore: [
    { label: "All temples", href: "/explore" },
    { label: "Browse by state", href: "/states" },
    { label: "Browse by deity", href: "/deities" },
    { label: "Most visited", href: "/explore?sort=popularity" },
  ],
  Contribute: [
    { label: "Suggest a temple", href: "/suggest" },
    { label: "Partner with us", href: "/contact" },
  ],
  Project: [
    { label: "About", href: "/about" },
    { label: "Methodology", href: "/methodology" },
  ],
};

const SOCIALS = ["Instagram", "YouTube", "X"];

export function Footer() {
  return (
    <footer className="bg-surface-sanctum text-porcelain">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="CTemples home">
              <GopuramMark className="h-7 w-7 text-magenta" />
              <span className="font-display text-lg text-porcelain">
                C<span className="text-coral">temples</span>
              </span>
            </Link>
            <p className="mt-5 font-display text-title-md text-porcelain">Every temple is a door.</p>
            <p className="mt-2 font-mono text-label uppercase tracking-label text-porcelain/50">
              A field guide to sacred India
            </p>
          </div>

          {(Object.keys(NAV) as (keyof typeof NAV)[]).map((group) => (
            <nav key={group} aria-label={group}>
              <h2 className="font-mono text-label uppercase tracking-label text-turmeric">{group}</h2>
              <ul className="mt-4 space-y-2.5 text-body-sm text-porcelain/75">
                {NAV[group].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition-colors hover:text-coral">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {group === "Project" ? (
                <>
                  <h2 className="mt-6 font-mono text-label uppercase tracking-label text-turmeric">Connect</h2>
                  <ul className="mt-4 space-y-2.5 text-body-sm text-porcelain/50">
                    {SOCIALS.map((name) => (
                      <li key={name} className="flex items-center justify-between gap-3">
                        <span>{name}</span>
                        <span className="font-mono text-[0.55rem] uppercase tracking-label text-porcelain/40">
                          Soon
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-porcelain/15 pt-6 font-mono text-label-sm uppercase tracking-label text-porcelain/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 CTemples · Made in India</span>
          <span className="sm:text-right">
            Base map: DataMeet, CC BY 4.0 · Imagery: Wikimedia Commons
          </span>
        </div>
        <p className="mt-3 font-mono text-label-sm uppercase tracking-label text-porcelain/40">
          A field-guide prototype · placeholder content · nothing is booked or sold here
        </p>
      </div>
    </footer>
  );
}
