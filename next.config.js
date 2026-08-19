const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      // Never let the service worker cache API responses. These are per-user,
      // auth-sensitive, and change often (contacts, sync, gifts, stats). Caching
      // them risks serving stale/empty data after a transient auth race, or even
      // leaking one user's cached data to the next person on a shared device.
      urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
      handler: "NetworkOnly",
    },
    // Fall back to next-pwa's default caching strategy for everything else
    // (static assets, fonts, images, pages).
    ...require("next-pwa/cache"),
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };

module.exports = withPWA(nextConfig);
