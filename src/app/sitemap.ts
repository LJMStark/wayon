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
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const route of STATIC_ROUTES) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}${normalizeMetadataPath(locale, route === '' ? '/' : route)}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
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
  fetchSlugs: () => Promise<string[]>,
): Promise<MetadataRoute.Sitemap> {
  try {
    const slugs = await fetchSlugs()
    return slugs.flatMap((slug) =>
      routing.locales.map((locale) => ({
        url: `${siteUrl}${normalizeMetadataPath(locale, `${pathPrefix}/${slug}`)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority,
      })),
    )
  } catch (error) {
    // Swallowing silently used to hide SEO regressions during CMS
    // outages (empty sitemap = de-indexing risk). Emit a structured
    // error so the Vercel Functions log shows which prefix failed and
    // why; the sitemap still completes with whatever static routes
    // were already collected.
    console.error(
      `sitemap: failed to fetch dynamic entries for ${pathPrefix}`,
      error,
    )
    return []
  }
}
