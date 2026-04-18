import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";


const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

type Redirect = { source: string; destination: string; permanent: boolean };

function redirect(source: string, destination: string): Redirect {
  return { source, destination, permanent: false };
}

const isDev = process.env.NODE_ENV === 'development';

// Site-wide Content Security Policy.
// Notes:
// - 'unsafe-inline' on script-src is required today for Next.js's inline hydration
//   bootstrap script. Hardening via per-request nonce + middleware is the next step.
// - 'unsafe-eval' is kept because (a) Sanity Studio's Vision tool and schema
//   evaluation rely on it, and (b) Next.js HMR uses it in development. A future
//   pass can scope it to development only once Studio is moved to a subdomain.
// - Sanity live queries use an EventSource over HTTPS plus WSS for presence.
// - Google Maps is embedded as an iframe on the contact page (mapEmbedUrl in
//   src/data/siteCopy.ts points at https://www.google.com/maps?...&output=embed).
// - Vercel Analytics + Speed Insights load from va.vercel-scripts.com and report
//   to vitals.vercel-insights.com; vercel.live is used by the preview toolbar.
const SITE_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-scripts.com https://vercel.live https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.googleusercontent.com https://*.google.com https://*.gstatic.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "frame-src 'self' https://www.google.com https://*.google.com https://vercel.live",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://vitals.vercel-insights.com https://va.vercel-scripts.com https://vercel.live",
  "media-src 'self' https://cdn.sanity.io",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join('; ');

// Sanity Studio is embedded at /studio. It bundles its own workers (blob:),
// evaluates user-authored schemas, and talks to multiple Sanity subdomains.
// A stricter policy breaks the Studio, so we relax script-src / worker-src /
// connect-src for this path while keeping the baseline hardening headers.
const STUDIO_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.sanity.io https://*.sanity.studio",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://*.googleusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "frame-src 'self' https://*.sanity.io https://*.sanity.studio",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.sanity.studio",
  "media-src 'self' blob: https://cdn.sanity.io",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

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
  images: {
    // 开发阶段跳过图片优化缓存，换图即刷新可见
    // 生产构建仍然启用优化
    unoptimized: isDev,
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
    // Two disjoint source patterns. Next.js evaluates every matching rule and
    // later same-key header values overwrite earlier ones, so ordering the
    // Studio rule first is not enough — the site rule would still win on
    // /studio/* paths. The site rule uses a path-to-regexp negative lookahead
    // that excludes `/studio` (and everything under it) so the two rules never
    // collide on the same request.
    return [
      {
        source: '/studio/:path*',
        headers: [
          ...SECURITY_HEADERS_BASE,
          { key: 'Content-Security-Policy', value: STUDIO_CSP },
        ],
      },
      {
        source: '/((?!studio(?:/.*)?$).*)',
        headers: [
          ...SECURITY_HEADERS_BASE,
          { key: 'Content-Security-Policy', value: SITE_CSP },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
