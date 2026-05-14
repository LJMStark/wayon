import { notFound } from "next/navigation";

import { NewsDetailPageView } from "@/features/news/components/NewsDetailPageView";
import { getNewsDetailPageData } from "@/features/news/server/getNewsDetailPageData";
import { getLocaleParams } from "@/features/shared/server/locale";
import { articleJsonLd, newsBreadcrumbJsonLd } from "@/lib/jsonLd";
import { buildPageMetadata, normalizeMetadataPath } from "@/lib/metadata";
import { lexicalToPlainText } from "@/lib/lexicalText";

// Published articles rarely change; hourly refresh is plenty.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/news/[slug]">): Promise<import("next").Metadata> {
  const { slug, locale } = await getLocaleParams(params);
  const pageData = await getNewsDetailPageData(locale, slug);

  if (!pageData) {
    notFound();
  }

  const description =
    pageData.excerpt ||
    (pageData.body ? lexicalToPlainText(pageData.body) : "") ||
    pageData.title;

  return buildPageMetadata({
    locale,
    title: pageData.title,
    description,
    image: pageData.imageUrl ?? undefined,
    imageAlt: pageData.title,
    path: `/news/${slug}`,
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
  const description =
    pageData.excerpt ||
    (pageData.body ? lexicalToPlainText(pageData.body) : "") ||
    pageData.title;
  const jsonLd = articleJsonLd({
    headline: pageData.title,
    description,
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
