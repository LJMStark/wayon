import { siteUrl } from "@/lib/env";
import type { AppLocale } from "@/i18n/types";
import { SOCIAL_LINKS } from "@/data/socialLinks";
import { normalizeMetadataPath } from "@/lib/localePath";

const NAV_LABELS: Record<AppLocale, { home: string; products: string; news: string }> = {
  zh: { home: "首页", products: "产品", news: "新闻" },
  en: { home: "Home", products: "Products", news: "News" },
  es: { home: "Inicio", products: "Productos", news: "Noticias" },
  ar: { home: "الرئيسية", products: "المنتجات", news: "الأخبار" },
};

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
    alternateName: ["ZYL Sintered Stone", "广东众岩联岩板科技有限公司"],
    url: siteUrl,
    logo: `${siteUrl}/assets/brand/logo-yanlian-yanban.jpg`,
    foundingDate: "2014",
    address: {
      "@type": "PostalAddress",
      streetAddress: FOSHAN_ADDRESS,
      addressLocality: "Foshan",
      addressRegion: "Guangdong",
      addressCountry: "CN",
    },
    telephone: "+86-132-2924-6894",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+86-132-2924-6894",
      contactType: "sales",
      areaServed: "Worldwide",
      availableLanguage: ["Chinese", "English", "Spanish", "Arabic"],
    },
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };
}

function localizedPageUrl(
  locale: AppLocale,
  path: "/" | "/products" | "/news",
): string {
  return `${siteUrl}${normalizeMetadataPath(locale, path)}`;
}

export function productsListBreadcrumbJsonLd(locale: AppLocale): Record<string, unknown> {
  const labels = NAV_LABELS[locale];
  return breadcrumbJsonLd(
    [
      { name: labels.home, url: localizedPageUrl(locale, "/") },
      { name: labels.products, url: localizedPageUrl(locale, "/products") },
    ],
    locale,
  );
}

export function newsListBreadcrumbJsonLd(locale: AppLocale): Record<string, unknown> {
  const labels = NAV_LABELS[locale];
  return breadcrumbJsonLd(
    [
      { name: labels.home, url: localizedPageUrl(locale, "/") },
      { name: labels.news, url: localizedPageUrl(locale, "/news") },
    ],
    locale,
  );
}

export function productBreadcrumbJsonLd(
  locale: AppLocale,
  productName: string,
  productUrl: string,
): Record<string, unknown> {
  const labels = NAV_LABELS[locale];
  return breadcrumbJsonLd(
    [
      { name: labels.home, url: localizedPageUrl(locale, "/") },
      { name: labels.products, url: localizedPageUrl(locale, "/products") },
      { name: productName, url: absoluteUrl(productUrl) },
    ],
    locale,
  );
}

export function newsBreadcrumbJsonLd(
  locale: AppLocale,
  articleTitle: string,
  articleUrl: string,
): Record<string, unknown> {
  const labels = NAV_LABELS[locale];
  return breadcrumbJsonLd(
    [
      { name: labels.home, url: localizedPageUrl(locale, "/") },
      { name: labels.news, url: localizedPageUrl(locale, "/news") },
      { name: articleTitle, url: absoluteUrl(articleUrl) },
    ],
    locale,
  );
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
      name: input.brand ?? "ZYL Sintered Stone",
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

  // Intentionally no `offers` block. Google's Product structured-data spec
  // requires `offers.price` + `offers.priceCurrency` (or AggregateOffer with
  // lowPrice/highPrice). This is a B2B catalog with quote-based pricing — we
  // do not publish a list price — so any Offer node we could emit would fail
  // Rich Results validation and drop the Product snippet entirely. Better to
  // ship a clean Product entity than a broken Offer. If we ever publish list
  // prices, add `offers: AggregateOffer` with lowPrice/highPrice/priceCurrency.

  return result;
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  url: string;
  author?: string;
}): Record<string, unknown> {
  const absoluteImages = input.image.filter(Boolean).map((img) => absoluteUrl(img));

  const absoluteArticleUrl = absoluteUrl(input.url);

  const result: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    url: absoluteArticleUrl,
    // Anchors the structured data to the canonical article page so Google
    // doesn't have to guess which URL the Article describes when the same
    // headline appears across locales or syndication targets.
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteArticleUrl,
    },
    author: {
      "@type": "Organization",
      name: input.author ?? "ZYL Sintered Stone",
    },
    publisher: {
      "@type": "Organization",
      name: "Guangdong ZYL Sintered Stone Technology Co., Ltd.",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/assets/brand/logo-yanlian-yanban.jpg`,
      },
    },
  };

  if (absoluteImages.length > 0) {
    result.image = absoluteImages;
  }

  return result;
}
