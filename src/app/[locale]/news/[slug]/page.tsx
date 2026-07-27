import { notFound } from "next/navigation";

import { getNewsSlugs } from "@/data/news";
import { NewsDetailPageView } from "@/features/news/components/NewsDetailPageView";
import {
  getNewsAvailableLocales,
  getNewsDetailPageData,
} from "@/features/news/server/getNewsDetailPageData";
import type { NewsDetailPageData } from "@/features/news/types";
import { getLocaleParams } from "@/features/shared/server/locale";
import { articleJsonLd, newsBreadcrumbJsonLd } from "@/lib/jsonLd";
import { lexicalToPlainText } from "@/lib/lexicalText";
import { buildPageMetadata, normalizeMetadataPath } from "@/lib/metadata";

function getNewsDescription(pageData: NewsDetailPageData): string {
  return (
    pageData.excerpt ||
    (pageData.body ? lexicalToPlainText(pageData.body) : "") ||
    pageData.title
  );
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const slugs = await getNewsSlugs();
    return slugs.map(({ slug }) => ({ slug }));
  } catch (error) {
    console.error("generateStaticParams: failed to fetch news slugs", error);
    return [];
  }
}

// Published articles rarely change; hourly refresh is plenty.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/news/[slug]">): Promise<import("next").Metadata> {
  const { slug, locale } = await getLocaleParams(params);
  const [pageData, locales] = await Promise.all([
    getNewsDetailPageData(locale, slug),
    getNewsAvailableLocales(slug),
  ]);

  if (!pageData) {
    notFound();
  }

  return buildPageMetadata({
    locale,
    locales,
    title: pageData.title,
    description: getNewsDescription(pageData),
    image: pageData.imageUrl ?? undefined,
    imageAlt: pageData.title,
    path: `/news/${slug}`,
    type: "article",
  });
}

export default async function NewsDetailPage({
  params,
}: PageProps<"/[locale]/news/[slug]">): Promise<React.JSX.Element> {
  const { slug, locale } = await getLocaleParams(params);
  const pageData = await getNewsDetailPageData(locale, slug);

  if (!pageData) {
    notFound();
  }

  const newsUrl = normalizeMetadataPath(locale, `/news/${slug}`);
  const jsonLd = articleJsonLd({
    headline: pageData.title,
    description: getNewsDescription(pageData),
    image: pageData.imageUrl ? [pageData.imageUrl] : [],
    datePublished: pageData.publishedAt,
    dateModified: pageData.updatedAt,
    url: newsUrl,
  });
  const breadcrumbLd = newsBreadcrumbJsonLd(locale, pageData.title, newsUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />
      <NewsDetailPageView {...pageData} />
    </>
  );
}
