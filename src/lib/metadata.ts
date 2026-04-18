import type { Metadata } from "next";

import { siteUrl } from "@/lib/env";
import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/i18n/types";

const METADATA_BASE = new URL(siteUrl);

type BuildPageMetadataOptions = {
  locale: AppLocale;
  title: string;
  description: string;
  imageAlt?: string;
  path?: string;
  includeIcons?: boolean;
};

function normalizeMetadataPath(locale: AppLocale, path: string): string {
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
  return {
    metadataBase: METADATA_BASE,
    title,
    description,
    icons: includeIcons ? { icon: "/assets/brand/favicon-wayon.jpg" } : undefined,
    openGraph: {
      title,
      description,
      url: normalizeMetadataPath(locale, path),
      siteName: "ZYL",
      images: [
        {
          url: "/assets/hero/home-hero-slide-2.png",
          width: 1920,
          height: 1080,
          alt: imageAlt ?? title,
        },
      ],
    },
  };
}
