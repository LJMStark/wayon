import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { siteUrl } from '@/lib/env'
import { normalizeMetadataPath } from '@/lib/metadata'

const STATIC_ROUTES = [
  '',
  '/about',
  '/products',
  '/solution',
  '/cases',
  '/news',
  '/contact',
  '/download',
  '/privacy',
  '/terms',
]

// Evaluated at module load. On Zeabur this resolves at build time during
// `next build` (the sitemap route is statically generated), so all static
// pages share the build timestamp. That is a coarse signal — every deploy
// makes static pages look "modified" even when copy did not change — but a
// frozen date (e.g. 2025-04-01) is strictly worse: Google deprioritizes
// re-crawling pages whose lastmod never moves. Per-route lastmod tracking
// would be more precise; until that exists, deploy time is the best
// approximation.
const STATIC_LAST_MODIFIED = new Date()

// Builds the xhtml:link hreflang map Google expects inside a sitemap <url>
// entry. Each locale plus an `x-default` pointing at `/en/...` — the primary
// fallback for international B2B traffic. Next.js renders this as
// `<xhtml:link rel="alternate" hreflang="..." href="..."/>` children of the
// parent <url>. Google's spec
// (developers.google.com/search/docs/specialty/international/localized-versions#sitemap)
// requires every language version to appear as its own <url> entry AND for
// every <url> to list every alternate (including itself). That is why we emit
// one entry per locale below, sharing the same languages map.
function buildLanguagesMap(path: string): Record<string, string> {
  const languages: Record<string, string> = {
    'x-default': `${siteUrl}${normalizeMetadataPath('en', path)}`,
  }
  for (const locale of routing.locales) {
    languages[locale] = `${siteUrl}${normalizeMetadataPath(locale, path)}`
  }
  return languages
}

// Defends against CMS payloads with missing / malformed `updatedAt`. Payload
// normally returns ISO strings, but a regression upstream (a freshly-created
// doc without a save, a manual data import, a future-dated record) could ship
// `Invalid Date` into the sitemap XML and break the entire <url> block. Fall
// back to module-load time when the input is unusable.
function safeLastModified(updatedAt: string | undefined | null): Date {
  if (!updatedAt) return STATIC_LAST_MODIFIED
  const parsed = new Date(updatedAt)
  return Number.isNaN(parsed.getTime()) ? STATIC_LAST_MODIFIED : parsed
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const route of STATIC_ROUTES) {
    const path = route === '' ? '/' : route
    const languages = buildLanguagesMap(path)
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}${normalizeMetadataPath(locale, path)}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : (['/privacy', '/terms'].includes(route) ? 0.3 : 0.8),
        alternates: { languages },
      })
    }
  }

  // CMS may be unreachable during build -- skip dynamic entries gracefully.
  entries.push(
    ...(await getDynamicEntries('/products', 0.7, async () => {
      const { getProductSlugs } = await import('@/data/products')
      return getProductSlugs()
    })),
  )
  entries.push(
    ...(await getDynamicEntries('/news', 0.6, async () => {
      const { getNewsSlugs } = await import('@/data/news')
      return getNewsSlugs()
    })),
  )

  return entries
}

async function getDynamicEntries(
  pathPrefix: string,
  priority: number,
  fetchSlugs: () => Promise<{ slug: string; updatedAt: string }[]>,
): Promise<MetadataRoute.Sitemap> {
  try {
    const items = await fetchSlugs()
    return items.flatMap(({ slug, updatedAt }) => {
      const path = `${pathPrefix}/${slug}`
      const languages = buildLanguagesMap(path)
      const lastModified = safeLastModified(updatedAt)
      return routing.locales.map((locale) => ({
        url: `${siteUrl}${normalizeMetadataPath(locale, path)}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority,
        alternates: { languages },
      }))
    })
  } catch (error) {
    // Swallowing silently used to hide SEO regressions during CMS
    // outages (empty sitemap = de-indexing risk). Emit a structured
    // error so the Zeabur container log shows which prefix failed and
    // why; the sitemap still completes with whatever static routes
    // were already collected.
    console.error(
      `sitemap: failed to fetch dynamic entries for ${pathPrefix}`,
      error,
    )
    return []
  }
}
