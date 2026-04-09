import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { getProductSlugs } from '@/data/products'
import { getNewsSlugs } from '@/data/news'

const BASE_URL = 'https://www.zylstone.com'

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
  const getLocalePrefix = (locale: (typeof routing.locales)[number]) => `/${locale}`

  // Static pages for each locale
  for (const route of STATIC_ROUTES) {
    for (const locale of routing.locales) {
      const prefix = getLocalePrefix(locale)
      entries.push({
        url: `${BASE_URL}${prefix}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
      })
    }
  }

  // Dynamic product pages
  try {
    const productSlugs = await getProductSlugs()
    for (const slug of productSlugs) {
      for (const locale of routing.locales) {
        const prefix = getLocalePrefix(locale)
        entries.push({
          url: `${BASE_URL}${prefix}/products/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      }
    }
  } catch {
    // Sanity may be unreachable during build -- skip dynamic products gracefully
  }

  // Dynamic news pages
  try {
    const newsSlugs = await getNewsSlugs()
    for (const slug of newsSlugs) {
      for (const locale of routing.locales) {
        const prefix = getLocalePrefix(locale)
        entries.push({
          url: `${BASE_URL}${prefix}/news/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }
  } catch {
    // Sanity may be unreachable during build -- skip dynamic news gracefully
  }

  return entries
}
