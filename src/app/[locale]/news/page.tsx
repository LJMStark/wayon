import {
  getMetadataCopy,
} from "@/data/siteCopy";
import { NewsPageView } from "@/features/news/components/NewsPageView";
import { getNewsPageData } from "@/features/news/server/getNewsPageData";
import { getLocaleParams } from "@/features/shared/server/locale";
import { buildPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/news">): Promise<import("next").Metadata> {
  const { locale } = await getLocaleParams(params);

  const metadataCopy = getMetadataCopy(locale).news;

  return buildPageMetadata({
    locale,
    title: metadataCopy.title,
    description: metadataCopy.description,
    path: "/news",
  });
}

export default async function NewsPage({
  params,
}: PageProps<"/[locale]/news">): Promise<React.JSX.Element> {
  const { locale } = await getLocaleParams(params);
  const pageData = await getNewsPageData(locale);

  return <NewsPageView {...pageData} />;
}
