import { getMetadataCopy } from "@/data/siteCopy";
import { ProductsPageView } from "@/features/products/components/ProductsPageView";
import { getProductsPageData } from "@/features/products/server/getProductsPageData";
import { getLocaleParams } from "@/features/shared/server/locale";
import { buildPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products">): Promise<import("next").Metadata> {
  const { locale } = await getLocaleParams(params);

  const metadataCopy = getMetadataCopy(locale).products;

  return buildPageMetadata({
    locale,
    title: metadataCopy.title,
    description: metadataCopy.description,
    path: "/products",
  });
}

export default async function CollectionsPage({
  params,
}: PageProps<"/[locale]/products">): Promise<React.JSX.Element> {
  const { locale } = await getLocaleParams(params);
  const pageData = await getProductsPageData(locale);

  return <ProductsPageView {...pageData} />;
}
