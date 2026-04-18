import { notFound } from "next/navigation";

import { NewsDetailPageView } from "@/features/news/components/NewsDetailPageView";
import { getNewsDetailPageData } from "@/features/news/server/getNewsDetailPageData";
import { getLocaleParams } from "@/features/shared/server/locale";
import { buildPageMetadata } from "@/lib/metadata";

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

  return buildPageMetadata({
    locale,
    title: pageData.title,
    description: pageData.excerpt || pageData.title,
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

  return <NewsDetailPageView {...pageData} />;
}
