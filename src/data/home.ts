import type { _Translator } from "use-intl";
import type { AppMessages } from "@/i18n/types";

export type HeroSlide = {
  type: "video" | "image";
  src: string;
  sources?: HomeVideoSource[];
  poster?: string;
  alt: string;
};

export type HomeVideoSource = {
  src: string;
  media?: string;
  type?: string;
};

export type AboutAlbumItem = {
  title: string;
  text: string;
  image: string;
  video?: string;
  videoSources?: HomeVideoSource[];
  href: string;
};

export type ProductItem = {
  title: string;
  description: string;
  href: string;
  image: string;
};

export type FeaturedProductPosterData = {
  eyebrow: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type SolutionItem = {
  label: string;
  title: string;
  description: string;
  href: string;
  image: string;
};

export type CaseItem = {
  title: string;
  image: string;
  href: string;
  objectPosition?: string;
};

export type PartnerItem = {
  title: string;
  scale: "sm" | "md" | "lg" | "xl";
  tone: "muted" | "primary" | "strong";
  x: number;
  y: number;
  delay: number;
};

export type NewsItem = {
  title: string;
  href: string;
  day: string;
  yearMonth: string;
};

export type SocialPost = {
  title: string;
  href: string;
  image: string;
};

export type AboutIntroFeature = {
  title: string;
  text: string;
};

export type AboutIntroImage = {
  src: string;
  alt: string;
};

export type AboutIntroData = {
  title: string;
  paragraphs: string[];
  href: string;
  cta: string;
  secondaryHref: string;
  secondaryCta: string;
  primaryImage: AboutIntroImage;
  secondaryImage: AboutIntroImage;
  features: AboutIntroFeature[];
};

export type NewsFeature = {
  title: string;
  excerpt: string;
  href: string;
  image: string;
};

type AppTranslator = _Translator<AppMessages>;
type AppMessageKey = Parameters<AppTranslator>[0];

const DEFAULT_R2_PUBLIC_URL =
  "https://pub-56e13f04b3fa43f6bf63a8e037e2e643.r2.dev";
const HOME_MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  process.env.R2_PUBLIC_URL ||
  DEFAULT_R2_PUBLIC_URL
).replace(/\/+$/, "");
const HOME_VIDEO_VERSION = "v20260508";
const DESKTOP_VIDEO_MEDIA = "(min-width: 1024px)";
const VIDEO_MP4_TYPE = "video/mp4";

function homeVideoUrl(filename: string): string {
  return `${HOME_MEDIA_BASE_URL}/${filename}`;
}

function getHomeVideoSources(
  filenameBase: string,
  hasDesktopSource = true
): { src: string; sources: HomeVideoSource[] } {
  const mobileSrc = homeVideoUrl(
    `${filenameBase}-720p-${HOME_VIDEO_VERSION}.mp4`
  );
  const desktopSrc = hasDesktopSource
    ? homeVideoUrl(`${filenameBase}-1080p-${HOME_VIDEO_VERSION}.mp4`)
    : mobileSrc;

  return {
    src: mobileSrc,
    sources:
      desktopSrc === mobileSrc
        ? [{ src: mobileSrc, type: VIDEO_MP4_TYPE }]
        : [
            {
              src: desktopSrc,
              media: DESKTOP_VIDEO_MEDIA,
              type: VIDEO_MP4_TYPE,
            },
            { src: mobileSrc, type: VIDEO_MP4_TYPE },
          ],
  };
}

const PAVILION_ENTRANCE_VIDEO = getHomeVideoSources(
  "home-about-pavilion-entrance"
);
const WAREHOUSE_VIDEO = getHomeVideoSources("home-about-warehouse");
const SHOWROOM_INTERIOR_VIDEO = getHomeVideoSources(
  "home-about-showroom-interior"
);
const FACTORY_PRODUCTION_VIDEO = getHomeVideoSources(
  "home-about-factory-production"
);
const CORE_EQUIPMENT_VIDEO = getHomeVideoSources(
  "home-about-core-equipment",
  false
);
const SERVICE_TEAM_VIDEO = getHomeVideoSources("home-about-service-team");

const HERO_SLIDE_CONFIG = [
  {
    type: "video",
    src: PAVILION_ENTRANCE_VIDEO.src,
    sources: PAVILION_ENTRANCE_VIDEO.sources,
    poster: "/assets/about/zyl-global-pavilion.png",
    altKey: "HomeData.AboutAlbum.item0.title",
  },
] as const satisfies ReadonlyArray<
  Omit<HeroSlide, "alt"> & { altKey: AppMessageKey }
>;

export const HERO_SLIDES: HeroSlide[] = HERO_SLIDE_CONFIG.map(
  (slideConfig) => ({
    type: slideConfig.type,
    src: slideConfig.src,
    sources: slideConfig.sources,
    poster: slideConfig.poster,
    alt: "ZYL Sintered Stone / Guangdong ZYL Sintered Stone",
  })
);

export function getHeroSlides(t: AppTranslator): HeroSlide[] {
  return HERO_SLIDE_CONFIG.map(({ altKey, ...slide }) => ({
    ...slide,
    alt: t(altKey),
  }));
}

const ABOUT_INTRO_CONFIG = {
  titleKey: "HomeData.AboutIntro.title",
  paragraphKeys: ["HomeData.AboutIntro.p1", "HomeData.AboutIntro.p2"],
  href: "/about",
  ctaKey: "HomeData.AboutIntro.cta",
  secondaryHref: "/contact",
  secondaryCtaKey: "Navigation.contactUs",
  primaryImage: {
    src: "/assets/about/zyl-global-opening-ribbon-cutting.png",
    altKey: "HomeData.AboutAlbum.item0.title",
  },
  secondaryImage: {
    src: "/assets/about/zyl-aesthetic-pavilion.png",
    altKey: "HomeData.AboutAlbum.item2.title",
  },
  featureKeys: [
    {
      titleKey: "HomeData.AboutAlbum.item1.title",
      textKey: "HomeData.AboutAlbum.item1.text",
    },
    {
      titleKey: "HomeData.AboutAlbum.item3.title",
      textKey: "HomeData.AboutAlbum.item3.text",
    },
    {
      titleKey: "HomeData.AboutAlbum.item5.title",
      textKey: "HomeData.AboutAlbum.item5.text",
    },
  ],
} as const satisfies {
  titleKey: AppMessageKey;
  paragraphKeys: readonly AppMessageKey[];
  href: string;
  ctaKey: AppMessageKey;
  secondaryHref: string;
  secondaryCtaKey: AppMessageKey;
  primaryImage: {
    src: string;
    altKey: AppMessageKey;
  };
  secondaryImage: {
    src: string;
    altKey: AppMessageKey;
  };
  featureKeys: readonly {
    titleKey: AppMessageKey;
    textKey: AppMessageKey;
  }[];
};

const ABOUT_ALBUM_CONFIG = [
  {
    titleKey: "HomeData.AboutAlbum.item1.title",
    textKey: "HomeData.AboutAlbum.item1.text",
    image: "/assets/about/zyl-warehouse-aerial.webp",
    video: WAREHOUSE_VIDEO.src,
    videoSources: WAREHOUSE_VIDEO.sources,
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item2.title",
    textKey: "HomeData.AboutAlbum.item2.text",
    image: "/assets/about/zyl-aesthetic-pavilion.png",
    video: SHOWROOM_INTERIOR_VIDEO.src,
    videoSources: SHOWROOM_INTERIOR_VIDEO.sources,
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item3.title",
    textKey: "HomeData.AboutAlbum.item3.text",
    image: "/assets/about/yunfu-wayon.webp",
    video: FACTORY_PRODUCTION_VIDEO.src,
    videoSources: FACTORY_PRODUCTION_VIDEO.sources,
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item4.title",
    textKey: "HomeData.AboutAlbum.item4.text",
    image: "/assets/about/guangdong-wayon.jpg",
    video: CORE_EQUIPMENT_VIDEO.src,
    videoSources: CORE_EQUIPMENT_VIDEO.sources,
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item5.title",
    textKey: "HomeData.AboutAlbum.item5.text",
    image: "/assets/about/zyl-fashion-pavilion.png",
    video: SERVICE_TEAM_VIDEO.src,
    videoSources: SERVICE_TEAM_VIDEO.sources,
    href: "/about",
  },
] as const satisfies ReadonlyArray<{
  titleKey: AppMessageKey;
  textKey: AppMessageKey;
  image: string;
  video?: string;
  videoSources?: HomeVideoSource[];
  href: string;
}>;

const HOME_PRODUCT_CONFIG = [
  {
    titleKey: "HomeData.HomeProducts.item0.title",
    descriptionKey: "HomeData.HomeProducts.item0.description",
    href: `/products?section=series&value=${encodeURIComponent("质感岩板")}`,
    image: "/assets/home-products/prod-0.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item1.title",
    descriptionKey: "HomeData.HomeProducts.item1.description",
    href: `/products?section=series&value=${encodeURIComponent("名石岩板")}`,
    image: "/assets/home-products/prod-1.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item2.title",
    descriptionKey: "HomeData.HomeProducts.item2.description",
    href: `/products?section=series&value=${encodeURIComponent("洞石岩板")}`,
    image: "/assets/home-products/prod-2.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item3.title",
    descriptionKey: "HomeData.HomeProducts.item3.description",
    href: `/products?section=series&value=${encodeURIComponent("木纹岩板")}`,
    image: "/assets/home-products/prod-3.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item4.title",
    descriptionKey: "HomeData.HomeProducts.item4.description",
    href: `/products?section=series&value=${encodeURIComponent("护墙岩板")}`,
    image: "/assets/home-products/prod-4.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item5.title",
    descriptionKey: "HomeData.HomeProducts.item5.description",
    href: `/products?section=series&value=${encodeURIComponent("艺术岩板")}`,
    image: "/assets/home-products/prod-5.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item6.title",
    descriptionKey: "HomeData.HomeProducts.item6.description",
    href: `/products?section=series&value=${encodeURIComponent("连纹岩板")}`,
    image: "/assets/home-products/prod-6.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item7.title",
    descriptionKey: "HomeData.HomeProducts.item7.description",
    href: `/products?section=series&value=${encodeURIComponent("创意网红")}`,
    image: "/assets/home-products/prod-7.jpg",
  },
] as const satisfies ReadonlyArray<{
  titleKey: AppMessageKey;
  descriptionKey: AppMessageKey;
  href: string;
  image: string;
}>;

const FEATURED_PRODUCT_POSTER_CONFIG = {
  eyebrowKey: "HomeData.FeaturedProductPoster.eyebrow",
  image: "/assets/home-products/featured-positioned-crystal-glaze.jpg",
  imageAltKey: "HomeData.FeaturedProductPoster.imageAlt",
  href: `/products?section=process&value=${encodeURIComponent("定位彩晶")}`,
} as const satisfies {
  eyebrowKey: AppMessageKey;
  image: string;
  imageAltKey: AppMessageKey;
  href: string;
};

const SOLUTION_CONFIG = [
  {
    labelKey: "HomeData.Solutions.item0.label",
    titleKey: "HomeData.Solutions.item0.title",
    descriptionKey: "HomeData.Solutions.item0.description",
    href: "/solution",
    image: "/assets/solutions/scene-kitchen-countertops.jpg",
  },
  {
    labelKey: "HomeData.Solutions.item1.label",
    titleKey: "HomeData.Solutions.item1.title",
    descriptionKey: "HomeData.Solutions.item1.description",
    href: "/solution",
    image: "/assets/solutions/scene-bathroom-spaces.jpg",
  },
  {
    labelKey: "HomeData.Solutions.item2.label",
    titleKey: "HomeData.Solutions.item2.title",
    descriptionKey: "HomeData.Solutions.item2.description",
    href: "/solution",
    image: "/assets/solutions/scene-furniture-tops.jpg",
  },
  {
    labelKey: "HomeData.Solutions.item3.label",
    titleKey: "HomeData.Solutions.item3.title",
    descriptionKey: "HomeData.Solutions.item3.description",
    href: "/solution",
    image: "/assets/hero/home-hero-lobby.jpg",
  },
  {
    labelKey: "HomeData.Solutions.item4.label",
    titleKey: "HomeData.Solutions.item4.title",
    descriptionKey: "HomeData.Solutions.item4.description",
    href: "/solution",
    image: "/assets/solutions/scene-commercial-showcase.jpg",
  },
] as const satisfies ReadonlyArray<{
  labelKey: AppMessageKey;
  titleKey: AppMessageKey;
  descriptionKey: AppMessageKey;
  href: string;
  image: string;
}>;

const ENGINEERING_CASE_CONFIG = [
  {
    titleKey: "HomeData.EngineeringCases.item0.title",
    image: "/assets/cases/case-1-weihao-hotel.png",
    href: "/assets/cases/case-1-weihao-hotel.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item1.title",
    image: "/assets/cases/case-2-guangzhou-yuehai-land.png",
    href: "/assets/cases/case-2-guangzhou-yuehai-land.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item2.title",
    image: "/assets/cases/case-3-qingyu-garden-hotel.png",
    href: "/assets/cases/case-3-qingyu-garden-hotel.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item3.title",
    image: "/assets/cases/case-4-lincheng-shanshui-hotel.jpg",
    href: "/assets/cases/case-4-lincheng-shanshui-hotel.jpg",
    objectPosition: "top center",
  },
  {
    titleKey: "HomeData.EngineeringCases.item4.title",
    image: "/assets/cases/case-5-weihao-partyk.png",
    href: "/assets/cases/case-5-weihao-partyk.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item5.title",
    image: "/assets/cases/case-6-yuehai-yungang-city.png",
    href: "/assets/cases/case-6-yuehai-yungang-city.png",
    objectPosition: "left bottom",
  },
] as const satisfies ReadonlyArray<{
  titleKey: AppMessageKey;
  image: string;
  href: string;
  objectPosition?: string;
}>;

const PARTNER_CONFIG = [
  {
    titleKey: "HomeData.PartnerCloud.item0.title",
    scale: "xl",
    tone: "strong",
    x: 30,
    y: 33,
    delay: 0,
  },
  {
    titleKey: "HomeData.PartnerCloud.item1.title",
    scale: "sm",
    tone: "muted",
    x: 43,
    y: 18,
    delay: 90,
  },
  {
    titleKey: "HomeData.PartnerCloud.item2.title",
    scale: "md",
    tone: "primary",
    x: 50,
    y: 31,
    delay: 180,
  },
  {
    titleKey: "HomeData.PartnerCloud.item3.title",
    scale: "lg",
    tone: "muted",
    x: 66,
    y: 27,
    delay: 270,
  },
  {
    titleKey: "HomeData.PartnerCloud.item4.title",
    scale: "sm",
    tone: "primary",
    x: 79,
    y: 31,
    delay: 360,
  },
  {
    titleKey: "HomeData.PartnerCloud.item5.title",
    scale: "sm",
    tone: "muted",
    x: 25,
    y: 47,
    delay: 450,
  },
  {
    titleKey: "HomeData.PartnerCloud.item6.title",
    scale: "md",
    tone: "muted",
    x: 42,
    y: 48,
    delay: 540,
  },
  {
    titleKey: "HomeData.PartnerCloud.item7.title",
    scale: "lg",
    tone: "strong",
    x: 57,
    y: 45,
    delay: 630,
  },
  {
    titleKey: "HomeData.PartnerCloud.item8.title",
    scale: "md",
    tone: "primary",
    x: 70,
    y: 49,
    delay: 720,
  },
  {
    titleKey: "HomeData.PartnerCloud.item9.title",
    scale: "md",
    tone: "primary",
    x: 84,
    y: 49,
    delay: 810,
  },
  {
    titleKey: "HomeData.PartnerCloud.item10.title",
    scale: "lg",
    tone: "strong",
    x: 32,
    y: 65,
    delay: 900,
  },
  {
    titleKey: "HomeData.PartnerCloud.item11.title",
    scale: "sm",
    tone: "primary",
    x: 46,
    y: 64,
    delay: 990,
  },
  {
    titleKey: "HomeData.PartnerCloud.item12.title",
    scale: "lg",
    tone: "strong",
    x: 53,
    y: 78,
    delay: 1080,
  },
  {
    titleKey: "HomeData.PartnerCloud.item13.title",
    scale: "xl",
    tone: "strong",
    x: 71,
    y: 66,
    delay: 1170,
  },
  {
    titleKey: "HomeData.PartnerCloud.item14.title",
    scale: "sm",
    tone: "muted",
    x: 89,
    y: 78,
    delay: 1260,
  },
] as const satisfies ReadonlyArray<{
  titleKey: AppMessageKey;
  scale: PartnerItem["scale"];
  tone: PartnerItem["tone"];
  x: number;
  y: number;
  delay: number;
}>;

const NEWS_FEATURE_CONFIG = {
  titleKey: "HomeData.NewsFeature.title",
  excerptKey: "HomeData.NewsFeature.excerpt",
  href: "/news",
  image: "/assets/news/news-feature.jpg",
} as const satisfies {
  titleKey: AppMessageKey;
  excerptKey: AppMessageKey;
  href: string;
  image: string;
};

const NEWS_ITEM_CONFIG = [
  {
    titleKey: "HomeData.NewsItems.item0.title",
    href: "/news",
    day: "24",
    yearMonth: "2025-11",
  },
  {
    titleKey: "HomeData.NewsItems.item1.title",
    href: "/news",
    day: "17",
    yearMonth: "2025-11",
  },
  {
    titleKey: "HomeData.NewsItems.item2.title",
    href: "/news",
    day: "10",
    yearMonth: "2025-11",
  },
  {
    titleKey: "HomeData.NewsItems.item3.title",
    href: "/news",
    day: "31",
    yearMonth: "2025-10",
  },
] as const satisfies ReadonlyArray<{
  titleKey: AppMessageKey;
  href: string;
  day: string;
  yearMonth: string;
}>;

export function getAboutIntro(t: AppTranslator): AboutIntroData {
  return {
    title: t(ABOUT_INTRO_CONFIG.titleKey),
    paragraphs: ABOUT_INTRO_CONFIG.paragraphKeys.map((key) => t(key)),
    href: ABOUT_INTRO_CONFIG.href,
    cta: t(ABOUT_INTRO_CONFIG.ctaKey),
    secondaryHref: ABOUT_INTRO_CONFIG.secondaryHref,
    secondaryCta: t(ABOUT_INTRO_CONFIG.secondaryCtaKey),
    primaryImage: {
      src: ABOUT_INTRO_CONFIG.primaryImage.src,
      alt: t(ABOUT_INTRO_CONFIG.primaryImage.altKey),
    },
    secondaryImage: {
      src: ABOUT_INTRO_CONFIG.secondaryImage.src,
      alt: t(ABOUT_INTRO_CONFIG.secondaryImage.altKey),
    },
    features: ABOUT_INTRO_CONFIG.featureKeys.map((item) => ({
      title: t(item.titleKey),
      text: t(item.textKey),
    })),
  };
}

export function getAboutAlbum(t: AppTranslator): AboutAlbumItem[] {
  return ABOUT_ALBUM_CONFIG.map((item) => ({
    title: t(item.titleKey),
    text: t(item.textKey),
    image: item.image,
    video: "video" in item ? item.video : undefined,
    videoSources: "videoSources" in item ? item.videoSources : undefined,
    href: item.href,
  }));
}

export function getHomeProducts(t: AppTranslator): ProductItem[] {
  return HOME_PRODUCT_CONFIG.map((item) => ({
    title: t(item.titleKey),
    description: t(item.descriptionKey),
    href: item.href,
    image: item.image,
  }));
}

export function getFeaturedProductPoster(
  t: AppTranslator
): FeaturedProductPosterData {
  return {
    eyebrow: t(FEATURED_PRODUCT_POSTER_CONFIG.eyebrowKey),
    image: FEATURED_PRODUCT_POSTER_CONFIG.image,
    imageAlt: t(FEATURED_PRODUCT_POSTER_CONFIG.imageAltKey),
    href: FEATURED_PRODUCT_POSTER_CONFIG.href,
  };
}

export function getSolutions(t: AppTranslator): SolutionItem[] {
  return SOLUTION_CONFIG.map((item) => ({
    label: t(item.labelKey),
    title: t(item.titleKey),
    description: t(item.descriptionKey),
    href: item.href,
    image: item.image,
  }));
}

export function getEngineeringCases(t: AppTranslator): CaseItem[] {
  return ENGINEERING_CASE_CONFIG.map((item) => ({
    title: t(item.titleKey),
    image: item.image,
    href: item.href,
    ...("objectPosition" in item
      ? { objectPosition: item.objectPosition }
      : {}),
  }));
}

export function getPartners(t: AppTranslator): PartnerItem[] {
  return PARTNER_CONFIG.map((item) => ({
    title: t(item.titleKey),
    scale: item.scale,
    tone: item.tone,
    x: item.x,
    y: item.y,
    delay: item.delay,
  }));
}

export function getNewsFeature(t: AppTranslator): NewsFeature {
  return {
    title: t(NEWS_FEATURE_CONFIG.titleKey),
    excerpt: t(NEWS_FEATURE_CONFIG.excerptKey),
    href: NEWS_FEATURE_CONFIG.href,
    image: NEWS_FEATURE_CONFIG.image,
  };
}

export function getNewsItems(t: AppTranslator): NewsItem[] {
  return NEWS_ITEM_CONFIG.map((item) => ({
    title: t(item.titleKey),
    href: item.href,
    day: item.day,
    yearMonth: item.yearMonth,
  }));
}
