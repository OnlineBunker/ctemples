/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keeps the eventual Docker runtime image small (section 11).
  output: "standalone",
  reactStrictMode: true,

  // Enables React's native <ViewTransition> for the card -> detail hero morph.
  // Next.js bundles the React canary that ships ViewTransition; this flag wraps
  // <Link> navigations in document.startViewTransition. See DESIGN.md + globals.css.
  experimental: {
    viewTransition: true,
  },

  images: {
    // Real temple photography is dropped in later (see README "Adding real content").
    // Until then, on-brand procedural SVG scenes render and next/image stays wired.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Placeholder photography is sourced from Wikimedia Commons (freely licensed).
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.ctemples.example" },
    ],
  },
};

export default nextConfig;
