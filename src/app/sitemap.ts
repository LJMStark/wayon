import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { getProductSlugs } from '@/data/products'
import { getNewsSlugs } from '@/data/news'
import { siteUrl } from '@/lib/env'

const STATIC_ROUTES = [
  '',
  '/about',
  '/products',
  '/solution',
  '/news',
  '/contact',
  '/download',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const route of STATIC_ROUTES) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
      })
    }
  }

  // Sanity may be unreachable during build -- skip dynamic entries gracefully.
  entries.push(...(await getDynamicEntries('/products', 0.7, getProductSlugs)))
  entries.push(...(await getDynamicEntries('/news', 0.6, getNewsSlugs)))

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
        url: `${siteUrl}/${locale}${pathPrefix}/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority,
      })),
    )
  } catch {
    return []
  }
}
