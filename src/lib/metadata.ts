import type { Metadata } from "next";

import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/i18n/types";

const METADATA_BASE = new URL("https://www.zylstone.com");

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

function getMetadataIcons(includeIcons: boolean): Metadata["icons"] | undefined {
  if (!includeIcons) {
    return undefined;
  }

  return {
    icon: "/assets/brand/favicon-wayon.jpg",
  };
}

export function buildPageMetadata({
  locale,
  title,
  description,
  imageAlt,
  path = "/",
  includeIcons = false,
}: BuildPageMetadataOptions): Metadata {
  const normalizedPath = normalizeMetadataPath(locale, path);
  const icons = getMetadataIcons(includeIcons);
  const metadata: Metadata = {
    metadataBase: METADATA_BASE,
    title,
    description,
    openGraph: {
      title,
      description,
      url: normalizedPath,
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

  if (icons) {
    metadata.icons = icons;
  }

  return metadata;
}
