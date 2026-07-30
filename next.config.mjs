/**
 * Content-Security-Policy.
 *
 * `script-src` carries `'unsafe-inline'` deliberately, not by omission: Next's App Router
 * bootstraps streamed RSC payloads through inline `<script>self.__next_f.push(...)</script>`
 * tags, so a nonce-free policy has no alternative. Removing it needs `middleware.ts` to mint a
 * per-request nonce, which would make every one of the 69 prerendered routes dynamic — a real
 * cost for a site whose pages are pure static content. The trade is acceptable *here* because
 * the app has no HTML-injection surface at all: no `dangerouslySetInnerHTML`, no `innerHTML`,
 * no `eval`, no user-generated content rendered anywhere (verified by grep). What the policy
 * still buys is large: an injected `<script src="//evil.com">` cannot load, `object-src` /
 * `base-uri` / `form-action` are locked down, and `'unsafe-eval'` is NOT granted.
 *
 * If user-generated content is ever rendered, this must move to a nonce-based policy first.
 *
 * `style-src` needs `'unsafe-inline'` for Next's critical-CSS injection and for the inline
 * `style={{…}}` attributes the layered hero compositions rely on.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // Wikimedia is the only third-party image origin (placeholder photography, CC-licensed).
  "img-src 'self' data: blob: https://upload.wikimedia.org",
  "font-src 'self' data:", // next/font self-hosts; no Google Fonts at runtime
  "connect-src 'self'", // server actions post same-origin only
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'", // clickjacking
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * Security headers. Next.js ships NONE of these by default, so without this block the site
 * would go live with no clickjacking protection, no HSTS, no MIME-sniffing protection and no
 * referrer policy.
 */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // 2 years + preload — the site is HTTPS-only in production.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy backstop for `frame-ancestors` (older browsers ignore CSP framing).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Geolocation IS used (Explore's "temples near me"), so it stays enabled for this origin;
  // every capability the app never asks for is denied outright.
  {
    key: "Permissions-Policy",
    value:
      "geolocation=(self), camera=(), microphone=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keeps the eventual Docker runtime image small (section 11).
  output: "standalone",
  reactStrictMode: true,
  // Don't advertise the framework to attackers scanning for known CVEs.
  poweredByHeader: false,

  // Enables React's native <ViewTransition> for the card -> detail hero morph.
  // Next.js bundles the React canary that ships ViewTransition; this flag wraps
  // <Link> navigations in document.startViewTransition. See DESIGN.md + globals.css.
  experimental: {
    viewTransition: true,
  },

  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Immutable, content-hashed build output can be cached hard.
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  images: {
    // Real temple photography is dropped in later (see README "Adding real content").
    // Until then, on-brand procedural SVG scenes render and next/image stays wired.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Wikimedia Commons (freely licensed) is the ONLY entry. `images.unsplash.com` and
      // `images.ctemples.example` were never referenced anywhere (0 matches), and every
      // allowed host is a host the image optimizer can be induced to fetch from — unused
      // entries are pure attack surface.
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
