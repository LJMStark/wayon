import { siteUrl } from "@/lib/env";
import type { AppLocale } from "@/i18n/types";
import { SOCIAL_LINKS } from "@/data/socialLinks";

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
    logo: `${siteUrl}/assets/brand/logo-wayon-stone-group.png`,
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

export function productBreadcrumbJsonLd(
  locale: AppLocale,
  productName: string,
  productUrl: string,
): Record<string, unknown> {
  const labels = NAV_LABELS[locale];
  return breadcrumbJsonLd(
    [
      { name: labels.home, url: siteUrl },
      { name: labels.products, url: `${siteUrl}${locale === "zh" ? "/products" : `/${locale}/products`}` },
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
      { name: labels.home, url: siteUrl },
      { name: labels.news, url: `${siteUrl}${locale === "zh" ? "/news" : `/${locale}/news`}` },
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

  result.offers = {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: "Guangdong ZYL Sintered Stone Technology Co., Ltd.",
    },
  };

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

  const result: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    url: absoluteUrl(input.url),
    author: {
      "@type": "Organization",
      name: input.author ?? "ZYL Sintered Stone",
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
