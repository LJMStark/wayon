import { HomePageView } from "@/features/home/components/HomePageView";
import { getHomePageData } from "@/features/home/server/getHomePageData";
import { getLocaleParams } from "@/features/shared/server/locale";

export default async function Home({
  params,
}: PageProps<"/[locale]">): Promise<React.JSX.Element> {
  const { locale } = await getLocaleParams(params);
  const homePageData = await getHomePageData(locale);

  return <HomePageView {...homePageData} />;
}
