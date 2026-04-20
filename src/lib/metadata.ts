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
  ru: "ru_RU",
};

type BuildPageMetadataOptions = {
  locale: AppLocale;
  title: string;
  description: string;
  imageAlt?: string;
  path?: string;
  includeIcons?: boolean;
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
  imageAlt,
  path = "/",
  includeIcons = false,
}: BuildPageMetadataOptions): Metadata {
  const canonical = normalizeMetadataPath(locale, path);

  // Build hreflang languages map: each locale → its localized path
  const defaultLocalePath = normalizeMetadataPath(routing.defaultLocale, path);
  const languages: Record<string, string> = { "x-default": defaultLocalePath };
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
    icons: includeIcons ? { icon: "/assets/brand/favicon-wayon.jpg" } : undefined,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: normalizeMetadataPath(locale, path),
      siteName: "ZYL",
      locale: ogLocale,
      alternateLocale: alternateLocales,
      images: [
        {
          url: "/assets/hero/home-hero-slide-2.png",
          width: 1920,
          height: 1080,
          alt: imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/hero/home-hero-slide-2.png"],
    },
  };
}
