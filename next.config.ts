import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";
import { buildLegacyProductCategoryRedirects } from "./src/data/navigationCategoryMap";


const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

type Redirect = { source: string; destination: string; permanent: boolean };

function redirect(source: string, destination: string): Redirect {
  return { source, destination, permanent: true };
}

const isDev = process.env.NODE_ENV === 'development';

// Media is served from Cloudflare R2 through the configured public hostname.
// NEXT_PUBLIC_R2_PUBLIC_URL lets client-side media code point at the same CDN
// hostname that CSP and next/image allow. R2_PUBLIC_URL remains the server-side
// fallback for existing deployments.
const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ??
  process.env.R2_PUBLIC_URL ??
  'https://pub-placeholder.r2.dev';
const R2_HOSTNAME = new URL(R2_PUBLIC_URL).hostname;
const R2_ORIGIN = `https://${R2_HOSTNAME}`;

// TRANSITIONAL — remove once the Payload URL backfill is done and verified.
//
// On 2026-09-02 the media bucket moved off R2's Public Development URL
// (`pub-*.r2.dev`: rate-limited, uncacheable, and DNS-blocked by ISPs in
// Turkey/South Korea/mainland China) onto the custom domain. Code and env vars
// switch over immediately, but Postgres still stores absolute `pub-*.r2.dev`
// URLs. Most are harmless: any row carrying a `media` relation has its URL
// regenerated from the env var on read (s3Storage's generateFileURL), so it
// already resolves to the new host. The exception is `products.cover_image_url`
// — 74 of 1852 products hold a bare string with no relation and still render
// the legacy origin. CSP must allow both or those covers are blocked outright.
//
// To retire: confirm `products.cover_image_url` holds no `pub-` URLs, then
// delete this constant and inline R2_ORIGIN back into MEDIA_ORIGINS.
const LEGACY_R2_ORIGIN = 'https://pub-56e13f04b3fa43f6bf63a8e037e2e643.r2.dev';
const MEDIA_ORIGINS =
  R2_ORIGIN === LEGACY_R2_ORIGIN ? [R2_ORIGIN] : [R2_ORIGIN, LEGACY_R2_ORIGIN];

// Site-wide Content Security Policy.
// Notes:
// - 'unsafe-inline' on script-src is required today for Next.js's inline hydration
//   bootstrap script. Hardening via per-request nonce + middleware is the next step.
// - 'unsafe-eval' is included ONLY in development because Next.js HMR requires it.
//   In production this directive is omitted to tighten the attack surface.
// - Google Maps is embedded as an iframe on the contact page (mapEmbedUrl in
//   src/data/siteCopy.ts points at https://www.google.com/maps?...&output=embed).
// - Cloudflare Web Analytics beacon (static.cloudflareinsights.com/beacon.min.js)
//   is injected at the Cloudflare edge for every response served through CF; the
//   beacon then POSTs telemetry to cloudflareinsights.com. Allowed in script-src
//   and connect-src below so the browser doesn't reject it.
function buildSiteCsp(dev: boolean): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(dev ? ["'unsafe-eval'"] : []),
    "https://static.cloudflareinsights.com",
    "https://www.googletagmanager.com",
    "https://hm.baidu.com",
  ].join(' ');

  const connectSrc = [
    "'self'",
    "https://cloudflareinsights.com",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://hm.baidu.com",
  ].join(' ');

  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    ...MEDIA_ORIGINS,
    "https://*.googleusercontent.com",
    "https://*.google.com",
    "https://*.gstatic.com",
    "https://www.google-analytics.com",
    "https://hm.baidu.com",
    "https://www.gravatar.com",
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src ${imgSrc}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-src 'self' https://www.google.com",
    `connect-src ${connectSrc}`,
    `media-src 'self' ${MEDIA_ORIGINS.join(' ')}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join('; ');
}

const SECURITY_HEADERS_BASE = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // CMS-backed static pages and sitemap generation query production Postgres
    // during deploys. Next spawns one worker per CPU, each with its own pg pool,
    // so the default fan-out (cpus × maxConcurrency) opened enough connections
    // to get dropped ("Connection terminated unexpectedly"), failing builds.
    // Bound concurrent DB connections and retry transient drops.
    cpus: 2,
    staticGenerationMaxConcurrency: 4,
    staticGenerationRetryCount: 3,
  },
  images: {
    // Disable Next's image optimizer in every environment. On this self-hosted
    // (Zeabur) deployment the /_next/image optimizer returns 500 for remote R2
    // images, and even when it worked it only added a Zeabur→R2 round trip for
    // no benefit: R2 is fronted by Cloudflare's CDN and the stored images are
    // already web-sized (~200KB). Serve them directly from R2/Cloudflare instead.
    // (Matches the sibling jinxin project's self-hosted setup.)
    unoptimized: true,
    // Inert while `unoptimized` is true, but kept in sync with MEDIA_ORIGINS so
    // re-enabling the optimizer later does not silently reject legacy media.
    remotePatterns: MEDIA_ORIGINS.map((origin) => ({
      protocol: 'https' as const,
      hostname: new URL(origin).hostname,
      pathname: '/**',
    })),
  },
  async redirects() {
    // Keep one public host. Zeabur terminates TLS for both hostnames, then this
    // permanent redirect consolidates backlinks and crawler signals on the
    // canonical apex domain while preserving the requested path and query.
    const canonicalHostRedirect = {
      source: '/:path*',
      has: [{ type: 'host' as const, value: 'www.zylsinteredstone.com' }],
      destination: 'https://zylsinteredstone.com/:path*',
      permanent: true,
    };

    // Legacy CMS category paths now land directly on the stable ASCII
    // catalog identifiers. The products page also accepts old `category`
    // and Chinese `section`/`value` queries and permanently redirects them.
    return [
      canonicalHostRedirect,
      ...buildLegacyProductCategoryRedirects().map(({ source, destination }) =>
        redirect(source, `/zh${destination}`)
      ),
      redirect('/page/about-us.html', '/zh/about'),
      redirect('/page/contact-us.html', '/zh/contact'),
      redirect('/solutions/engineering-case.html', '/zh/solution'),
      redirect('/products/all.html', '/zh/products'),
    ];
  },
  async headers() {
    const SITE_CSP = buildSiteCsp(isDev);
    return [
      // Baseline security headers for every route, including /admin and /api.
      {
        source: '/:path*',
        headers: SECURITY_HEADERS_BASE,
      },
      // CSP only for public site routes. Payload admin and Payload/trade-media
      // API routes are excluded via negative lookahead so no CSP header is
      // emitted at all (browsers intersect multiple CSP headers, so an empty
      // value would not be equivalent to omission).
      {
        source: '/((?!admin(?:/|$)|api(?:/|$)).*)',
        headers: [{ key: 'Content-Security-Policy', value: SITE_CSP }],
      },
      // X-Robots-Tag for the Payload admin. robots.txt already disallows
      // /admin, but external links into the admin URL could still cause
      // Google to index the URL itself (without crawling content). This
      // header is a belt-and-braces signal that the URL must not appear in
      // search results at all.
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      // Short edge cache for HTML routes and crawler-facing files. Measured
      // 2026-05-27: /products/[slug] and /news/[slug] currently ship NO
      // Cache-Control header at all, so Cloudflare Cache Rule "Short cache
      // for HTML" (which keys off origin TTL signals) ends up BYPASS for
      // every ISR route. The result is a ~1s TTFB for every request — felt
      // most by international B2B traffic crossing the ocean to Zeabur.
      // Pinning `s-maxage=300` forces a 5-minute edge TTL, dropping TTFB
      // to ~50ms once the cache warms; `stale-while-revalidate=86400` lets
      // CF serve a slightly-stale copy while it fetches a fresh one in the
      // background for the next 24h, so an expired cache never costs a
      // user wait.
      //
      // Trade-off: Payload publish → visible page delay can be up to ~5
      // minutes. Acceptable for a quote-based B2B catalog. If we need
      // instant publish later, add a Payload afterChange hook that POSTs
      // to Cloudflare's purge_cache API.
      //
      // All public languages use explicit URL prefixes, so this rule covers
      // bare `/zh`, `/en/about`, and `/ar/products/foo-bar` alike without
      // caching the unprefixed locale-selection redirect at `/`.
      {
        source: '/:locale(en|zh|es|ar)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:file(robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=86400',
          },
        ],
      },
      // Long-lived caching for /public/assets design imagery. Next serves
      // /public with `Cache-Control: public, max-age=0` by default, so without
      // this both the browser and Cloudflare re-validate these files on every
      // request. They change rarely; if you replace one in place, purge
      // Cloudflare or rename it. This rule is declared AFTER the short-cache
      // rule above so the longer TTL wins by Next.js header-merge semantics
      // (later rule overrides earlier on the same key).
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      // Catalog PDFs and inspection reports under /public/downloads. Like
      // /assets they change rarely and otherwise inherit Next's default
      // `max-age=0`, forcing the browser and Cloudflare to re-validate every
      // request. Rename or purge Cloudflare if a file is replaced in place.
      {
        source: '/downloads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default withPayload(withNextIntl(nextConfig));
