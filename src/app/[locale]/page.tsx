import { HomePageView } from "@/features/home/components/HomePageView";
import { getHomePageData } from "@/features/home/server/getHomePageData";
import { getLocaleParams } from "@/features/shared/server/locale";

export default async function Home({
  params,
}: PageProps<"/[locale]">): Promise<React.JSX.Element> {
  const { locale } = await getLocaleParams(params);
  const homePageData = await getHomePageData(locale);

  // The home hero is a <video> whose poster image is the LCP element. The
  // poster preload is declared statically in src/app/[locale]/layout.tsx
  // <head> so the browser's preload scanner discovers it in the first HTML
  // chunk. Keeping the preload here (in a server component that awaits
  // data) emitted the <link> too late — the head had already been flushed
  // to the client by the time React streamed the body containing it.
  return <HomePageView {...homePageData} />;
}
