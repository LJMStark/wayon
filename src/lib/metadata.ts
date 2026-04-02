import type { Metadata } from "next";

import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/i18n/types";

const METADATA_BASE = new URL("https://www.zylstone.com");

export function buildPageMetadata({
  locale,
  title,
  description,
  imageAlt,
  path = "/",
  includeIcons = false,
}: {
  locale: AppLocale;
  title: string;
  description: string;
  imageAlt?: string;
  path?: string;
  includeIcons?: boolean;
}): Metadata {
  const normalizedPath =
    locale === routing.defaultLocale
      ? path
      : `/${locale}${path === "/" ? "" : path}`;

  return {
    metadataBase: METADATA_BASE,
    ...(includeIcons
      ? {
          icons: {
            icon: "/assets/brand/favicon-wayon.jpg",
          },
        }
      : {}),
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
}
