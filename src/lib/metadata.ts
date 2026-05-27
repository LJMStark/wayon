import type { Metadata } from "next";

import { siteUrl } from "@/lib/env";
import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/i18n/types";

const METADATA_BASE = new URL(siteUrl);

const LOCALE_OG_MAP: Record<AppLocale, string> = {
  zh: "zh_CN",
  en: "en_US",
  es: "es_ES",
  ar: "ar_AE",
};

type BuildPageMetadataOptions = {
  locale: AppLocale;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  path?: string;
  includeIcons?: boolean;
  // Open Graph type. Defaults to "website"; news detail pages pass "article".
  // Product pages stay on "website" because schema.org/Product covers product
  // semantics via JSON-LD (Facebook removed og:type=product support in 2014).
  type?: "website" | "article";
};

export function normalizeMetadataPath(locale: AppLocale, path: string): string {
  if (locale === routing.defaultLocale) {
    return path;
  }

  if (path === "/") {
    return `/${locale}`;
  }

  return `/${locale}${path}`;
}

export function buildPageMetadata({
  locale,
  title,
  description,
  image = "/assets/brand/og-default.jpg",
  imageAlt,
  path = "/",
  includeIcons = false,
  type = "website",
}: BuildPageMetadataOptions): Metadata {
  const canonical = normalizeMetadataPath(locale, path);

  // Build hreflang languages map: each locale → its localized path
  // x-default points to English — the primary language for international B2B traffic
  const languages: Record<string, string> = { "x-default": normalizeMetadataPath("en", path) };
  for (const loc of routing.locales) {
    languages[loc] = normalizeMetadataPath(loc, path);
  }

  const ogLocale = LOCALE_OG_MAP[locale];
  const alternateLocales = routing.locales
    .filter((loc) => loc !== locale)
    .map((loc) => LOCALE_OG_MAP[loc]);

  return {
    metadataBase: METADATA_BASE,
    title,
    description,
    icons: includeIcons
      ? {
          icon: [{ url: "/assets/brand/favicon.png", sizes: "32x32", type: "image/png" }],
          apple: [{ url: "/assets/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
        }
      : undefined,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type,
      title,
      description,
      url: normalizeMetadataPath(locale, path),
      siteName: "ZYL Sintered Stone",
      locale: ogLocale,
      alternateLocale: alternateLocales,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
