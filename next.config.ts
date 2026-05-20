import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";


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
    R2_ORIGIN,
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
    `media-src 'self' ${R2_ORIGIN}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
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
    // Static generation prerenders ~2,200 product/news pages against the
    // production Postgres at deploy time. Next spawns one worker per CPU, each
    // with its own pg pool, so the default fan-out (cpus × maxConcurrency)
    // opened enough connections to get dropped ("Connection terminated
    // unexpectedly"), failing the build. Bound concurrent DB connections and
    // retry transient drops so a deploy never fails on a single dropped
    // connection.
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
    remotePatterns: [
      { protocol: 'https', hostname: R2_HOSTNAME, pathname: '/**' },
    ],
  },
  async redirects() {
    // Legacy URLs from the previous CMS keep using the ASCII-only
    // `?category=<slug>` alias. The new canonical URL is
    // `?section=series&value=<chinese>`, but Next.js cannot emit a
    // Location header containing multi-byte UTF-8 (Node's HTTP layer
    // rejects it). The products page resolves `category=<slug>` via
    // navigationCategoryMap so the visitor still lands on the right
    // filter view; navigation menu links use the canonical query
    // because the browser handles encoding for anchor hrefs.
    return [
      redirect('/products/quartz', '/products?category=quartz'),
      redirect('/products/terrazzo', '/products?category=terrazzo'),
      redirect('/products/flexible-stone', '/products?category=flexible-stone'),
      redirect('/products/marble', '/products?category=marble'),
      redirect('/products/gem-stone', '/products?category=gem-stone'),
      redirect('/products/silica-free', '/products?category=silica-free'),
      redirect('/products/quartz.html', '/products?category=quartz'),
      redirect('/products/flexible-stone.html', '/products?category=flexible-stone'),
      redirect('/page/about-us.html', '/about'),
      redirect('/page/contact-us.html', '/contact'),
      redirect('/solutions/engineering-case.html', '/solution'),
      redirect('/products/all.html', '/products'),
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
      // Long-lived caching for /public/assets design imagery. Next serves
      // /public with `Cache-Control: public, max-age=0` by default, so without
      // this both the browser and Cloudflare re-validate these files on every
      // request. They change rarely; if you replace one in place, purge
      // Cloudflare or rename it. (HTML pages already get correct per-route
      // Cache-Control from Next; making Cloudflare honor it for HTML is a
      // dashboard Cache Rule, not a code change.)
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
