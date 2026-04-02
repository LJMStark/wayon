import type { Metadata } from "next";

import { getMetadataCopy } from "@/data/siteCopy";
import { buildPageMetadata } from "@/lib/metadata";
import { hasLocale } from "@/i18n/types";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = hasLocale(locale) ? locale : routing.defaultLocale;
  const metadataCopy = getMetadataCopy(activeLocale).contact;

  return buildPageMetadata({
    locale: activeLocale,
    title: metadataCopy.title,
    description: metadataCopy.description,
    path: "/contact",
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
