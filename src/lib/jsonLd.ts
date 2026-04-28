import { siteUrl } from "@/lib/env";
import type { AppLocale } from "@/i18n/types";
import { SOCIAL_LINKS } from "@/data/socialLinks";

// Foshan address from src/data/siteCopy.ts (EN version of office address)
const FOSHAN_ADDRESS =
  "No. 7-8, 10, 11-2, 12, Block 3, Taobo 3rd Road, Huaxia Ceramic Expo City, Nanzhuang Town, Chancheng District, Foshan, Guangdong, China";

function absoluteUrl(value: string): string {
  return value.startsWith("http") ? value : `${siteUrl}${value}`;
}

export function organizationJsonLd(locale: AppLocale): Record<string, unknown> {
  void locale; // parameter reserved for future locale-specific overrides

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Guangdong ZYL Sintered Stone Technology Co., Ltd.",
    alternateName: ["ZYL", "广东众岩联岩板科技有限公司"],
    url: siteUrl,
    logo: `${siteUrl}/assets/brand/logo-wayon-stone-group.png`,
    foundingDate: "2014",
    address: {
      "@type": "PostalAddress",
      streetAddress: FOSHAN_ADDRESS,
      addressLocality: "Foshan",
      addressRegion: "Guangdong",
      addressCountry: "CN",
    },
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };
}

export function breadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; url: string }>,
  locale: AppLocale,
): Record<string, unknown> {
  void locale; // reserved for locale-specific formatting

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  image: string[];
  sku?: string;
  category?: string;
  brand?: string;
  url: string;
}): Record<string, unknown> {
  const absoluteImages = input.image.map((img) => absoluteUrl(img));

  const result: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    url: `${siteUrl}${input.url}`,
    brand: {
      "@type": "Organization",
      name: input.brand ?? "ZYL",
    },
  };

  if (absoluteImages.length > 0) {
    result.image = absoluteImages;
  }

  if (input.sku) {
    result.sku = input.sku;
  }

  if (input.category) {
    result.category = input.category;
  }

  return result;
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  image: string[];
  datePublished: string;
  url: string;
  author?: string;
}): Record<string, unknown> {
  const absoluteImages = input.image.filter(Boolean).map((img) => absoluteUrl(img));

  const result: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    url: absoluteUrl(input.url),
    author: {
      "@type": "Organization",
      name: input.author ?? "ZYL",
    },
    publisher: {
      "@type": "Organization",
      name: "Guangdong ZYL Sintered Stone Technology Co., Ltd.",
    },
  };

  if (absoluteImages.length > 0) {
    result.image = absoluteImages;
  }

  return result;
}
