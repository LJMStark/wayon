import { getMetadataCopy } from "@/data/siteCopy";
import { ProductsPageView } from "@/features/products/components/ProductsPageView";
import { getProductsPageData } from "@/features/products/server/getProductsPageData";
import { getLocaleParams } from "@/features/shared/server/locale";
import { buildPageMetadata } from "@/lib/metadata";

// Catalog data refreshes hourly. Mitigates the heavy variant+media join
// performed by getProducts() → hydrateProducts() in src/data/products.ts.
export const revalidate = 3600;

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
  searchParams,
}: PageProps<"/[locale]/products">): Promise<React.JSX.Element> {
  const { locale } = await getLocaleParams(params);
  const pageData = await getProductsPageData(locale, await searchParams);

  return <ProductsPageView {...pageData} />;
}
