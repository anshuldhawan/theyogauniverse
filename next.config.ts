import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// PostHog reverse proxy targets (ANL-1): routing capture through /ingest on
// our own domain keeps ad blockers from dropping events. The static assets
// live on a sibling host (us-assets / eu-assets).
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const posthogAssetsHost = posthogHost
  .replace("://us.i.", "://us-assets.i.")
  .replace("://eu.i.", "://eu-assets.i.");

const nextConfig: NextConfig = {
  // SEO-1: every indexable page is server-rendered; no static export.
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Required by the /ingest proxy (PostHog clients may post with a trailing
  // slash); canonical URLs are unaffected (they never use trailing slashes).
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `${posthogAssetsHost}/static/:path*` },
      { source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
    ];
  },
  async redirects() {
    return [
      { source: "/yoga-retreats", destination: "/directory?kind=retreat", permanent: true },
      {
        source: "/yoga-teacher-training",
        destination: "/directory?kind=training",
        permanent: true,
      },
    ];
  },
  // NFR security baseline (COMP/NFR): defence-in-depth headers on every route.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=(self), payment=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

const config = withNextIntl(nextConfig);

// Sentry's build wrapper (source-map upload, release tagging) only engages
// once the Marketplace integration has provisioned its env vars; local and
// offline builds skip it entirely.
export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(config, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
      widenClientFileUpload: true,
      sourcemaps: { deleteSourcemapsAfterUpload: true },
    })
  : config;
