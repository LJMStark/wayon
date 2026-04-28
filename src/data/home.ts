import type { _Translator } from "use-intl";
import type { AppMessages } from "@/i18n/types";

export type HeroSlide = {
  type: "video" | "image";
  src: string;
  alt: string;
};

export type AboutAlbumItem = {
  title: string;
  text: string;
  image: string;
  href: string;
};

export type ProductItem = {
  title: string;
  description: string;
  href: string;
  image: string;
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

export type AboutIntroData = {
  title: string;
  paragraphs: string[];
  href: string;
  cta: string;
};

export type NewsFeature = {
  title: string;
  excerpt: string;
  href: string;
  image: string;
};

type AppTranslator = _Translator<AppMessages>;
type AppMessageKey = Parameters<AppTranslator>[0];

export const HERO_SLIDES: HeroSlide[] = [
  {
    type: "image",
    src: "/assets/hero/hero-zyl-global.png",
    alt: "众岩联全球馆",
  },
  {
    type: "image",
    src: "/assets/hero/hero-lifestyle-slab.png",
    alt: "众岩联为美好生活做好每一片岩板",
  },
];

const ABOUT_INTRO_CONFIG = {
  titleKey: "HomeData.AboutIntro.title",
  paragraphKeys: ["HomeData.AboutIntro.p1", "HomeData.AboutIntro.p2"],
  href: "/about",
  ctaKey: "HomeData.AboutIntro.cta",
} as const satisfies {
  titleKey: AppMessageKey;
  paragraphKeys: readonly AppMessageKey[];
  href: string;
  ctaKey: AppMessageKey;
};

const ABOUT_ALBUM_CONFIG = [
  {
    titleKey: "HomeData.AboutAlbum.item0.title",
    textKey: "HomeData.AboutAlbum.item0.text",
    image: "/assets/about/zyl-global-pavilion.png",
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item1.title",
    textKey: "HomeData.AboutAlbum.item1.text",
    image: "/assets/about/about-album-wayon-group.jpg",
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item2.title",
    textKey: "HomeData.AboutAlbum.item2.text",
    image: "/assets/about/zyl-aesthetic-pavilion.png",
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item3.title",
    textKey: "HomeData.AboutAlbum.item3.text",
    image: "/assets/about/yunfu-wayon.webp",
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item4.title",
    textKey: "HomeData.AboutAlbum.item4.text",
    image: "/assets/about/guangdong-wayon.jpg",
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item5.title",
    textKey: "HomeData.AboutAlbum.item5.text",
    image: "/assets/about/zyl-fashion-pavilion.png",
    href: "/about",
  },
] as const satisfies ReadonlyArray<{
  titleKey: AppMessageKey;
  textKey: AppMessageKey;
  image: string;
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
    image: "/assets/solutions/scene-wall-floor.jpg",
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
    image: "/assets/cases/case-1-guangzhou-agile-hotel.png",
    href: "/assets/cases/case-1-guangzhou-agile-hotel.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item1.title",
    image: "/assets/cases/case-2-beijing-children-palace.png",
    href: "/assets/cases/case-2-beijing-children-palace.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item2.title",
    image: "/assets/cases/case-3-sanfu-art-museum.png",
    href: "/assets/cases/case-3-sanfu-art-museum.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item3.title",
    image: "/assets/cases/case-4-huamao-international-hotel.png",
    href: "/assets/cases/case-4-huamao-international-hotel.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item4.title",
    image: "/assets/cases/case-5-guangzhou-baiyun-airport.png",
    href: "/assets/cases/case-5-guangzhou-baiyun-airport.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item5.title",
    image: "/assets/cases/case-6-nankai-university.png",
    href: "/assets/cases/case-6-nankai-university.png",
  },
] as const satisfies ReadonlyArray<{
  titleKey: AppMessageKey;
  image: string;
  href: string;
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
  };
}

export function getAboutAlbum(t: AppTranslator): AboutAlbumItem[] {
  return ABOUT_ALBUM_CONFIG.map((item) => ({
    title: t(item.titleKey),
    text: t(item.textKey),
    image: item.image,
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
