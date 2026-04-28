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
// The R2_PUBLIC_URL env var is the source of truth — used both for CSP and
// next/image remotePatterns so there's no drift between them.
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? 'https://pub-placeholder.r2.dev';
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
// - Vercel Analytics + Speed Insights load from va.vercel-scripts.com and report
//   to vitals.vercel-insights.com; vercel.live is used by the preview toolbar.
function buildSiteCsp(dev: boolean): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(dev ? ["'unsafe-eval'"] : []),
    "https://*.vercel-scripts.com",
    "https://vercel.live",
    "https://va.vercel-scripts.com",
    "https://www.googletagmanager.com",
    "https://hm.baidu.com",
  ].join(' ');

  const connectSrc = [
    "'self'",
    "https://vitals.vercel-insights.com",
    "https://va.vercel-scripts.com",
    "https://vercel.live",
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
    "frame-src 'self' https://www.google.com https://*.google.com https://vercel.live",
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
  images: {
    // 开发阶段跳过图片优化缓存，换图即刷新可见
    // 生产构建仍然启用优化
    unoptimized: isDev,
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
    ];
  },
};

export default withPayload(withNextIntl(nextConfig));
