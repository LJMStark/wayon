import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/trade-media/'],
        disallow: ['/admin/', '/api/', '/studio'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
