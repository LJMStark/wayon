import { HomePageView } from "@/features/home/components/HomePageView";
import { getHomePageData } from "@/features/home/server/getHomePageData";
import { getLocaleParams } from "@/features/shared/server/locale";

export default async function Home({
  params,
}: PageProps<"/[locale]">): Promise<React.JSX.Element> {
  const { locale } = await getLocaleParams(params);
  const homePageData = await getHomePageData(locale);

  // The home hero is a <video> with a poster frame. That poster image is the
  // LCP element on mobile (where the 720p hero video can take 10+ seconds on
  // throttled 4G). Surface the poster URL as a high-priority preload so the
  // browser starts the fetch during HTML parse instead of waiting to discover
  // the <video poster="..."> attribute. React 19 hoists this <link> into
  // <head> automatically when rendered inside any component. For image slides
  // we preload the slide image directly.
  const firstSlide = homePageData.hero.slides[0];
  const heroLcpImage =
    firstSlide?.type === "video" ? firstSlide.poster : firstSlide?.src;

  return (
    <>
      {heroLcpImage ? (
        <link
          rel="preload"
          as="image"
          href={heroLcpImage}
          fetchPriority="high"
        />
      ) : null}
      <HomePageView {...homePageData} />
    </>
  );
}
