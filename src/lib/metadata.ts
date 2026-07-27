import type { Metadata } from "next";

import { siteUrl } from "@/lib/env";
import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/i18n/types";
import { normalizeMetadataPath } from "@/lib/localePath";

export { normalizeMetadataPath } from "@/lib/localePath";

const METADATA_BASE = new URL(siteUrl);

const LOCALE_OG_MAP: Record<AppLocale, string> = {
  zh: "zh_CN",
  en: "en_US",
  es: "es_ES",
  ar: "ar_AE",
};

const LOCALE_ICON_MAP: Record<
  AppLocale,
  { apple: string; icon: string }
> = {
  zh: {
    apple: "/assets/brand/apple-touch-icon.png",
    icon: "/assets/brand/favicon.png",
  },
  en: {
    apple: "/assets/brand/apple-touch-icon-zylsinteredstone.png",
    icon: "/assets/brand/favicon-zylsinteredstone.png",
  },
  es: {
    apple: "/assets/brand/apple-touch-icon-zylsinteredstone.png",
    icon: "/assets/brand/favicon-zylsinteredstone.png",
  },
  ar: {
    apple: "/assets/brand/apple-touch-icon-zylsinteredstone.png",
    icon: "/assets/brand/favicon-zylsinteredstone.png",
  },
};

type BuildPageMetadataOptions = {
  locale: AppLocale;
  locales?: readonly AppLocale[];
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

export function buildPageMetadata({
  locale,
  locales = routing.locales,
  title,
  description,
  image = "/assets/brand/og-default.jpg",
  imageAlt,
  path = "/",
  includeIcons = false,
  type = "website",
}: BuildPageMetadataOptions): Metadata {
  const canonical = normalizeMetadataPath(locale, path);

  // Build hreflang only for language versions that actually exist. English is
  // the international B2B fallback when available; otherwise use the active
  // locale, which is guaranteed to resolve because this page is rendering.
  const defaultLocale = locales.includes("en") ? "en" : locale;
  const languages: Record<string, string> = {
    "x-default": normalizeMetadataPath(defaultLocale, path),
  };
  for (const loc of locales) {
    languages[loc] = normalizeMetadataPath(loc, path);
  }

  const ogLocale = LOCALE_OG_MAP[locale];
  const localeIcon = LOCALE_ICON_MAP[locale];
  const alternateLocales = locales
    .filter((loc) => loc !== locale)
    .map((loc) => LOCALE_OG_MAP[loc]);

  return {
    metadataBase: METADATA_BASE,
    title,
    description,
    icons: includeIcons
      ? {
          icon: [{ url: localeIcon.icon, sizes: "32x32", type: "image/png" }],
          apple: [{ url: localeIcon.apple, sizes: "180x180", type: "image/png" }],
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
