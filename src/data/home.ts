import type { _Translator } from "use-intl";
import type { AppMessages } from "@/i18n/types";
import { HOME_VISUAL_PLACEHOLDER_IMAGE } from "@/features/home/model/homeVisuals";

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
  description: string;
  image: string;
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

export type SocialPlatform = {
  name: string;
  icon: string;
  posts: SocialPost[];
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
    src: HOME_VISUAL_PLACEHOLDER_IMAGE,
    alt: "ZYL placeholder",
  },
  {
    type: "image",
    src: HOME_VISUAL_PLACEHOLDER_IMAGE,
    alt: "ZYL placeholder",
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
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item1.title",
    textKey: "HomeData.AboutAlbum.item1.text",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item2.title",
    textKey: "HomeData.AboutAlbum.item2.text",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item3.title",
    textKey: "HomeData.AboutAlbum.item3.text",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item4.title",
    textKey: "HomeData.AboutAlbum.item4.text",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item5.title",
    textKey: "HomeData.AboutAlbum.item5.text",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
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
    href: "/products?category=quartz",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.HomeProducts.item1.title",
    descriptionKey: "HomeData.HomeProducts.item1.description",
    href: "/products?category=terrazzo",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.HomeProducts.item2.title",
    descriptionKey: "HomeData.HomeProducts.item2.description",
    href: "/products?category=flexible-stone",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.HomeProducts.item3.title",
    descriptionKey: "HomeData.HomeProducts.item3.description",
    href: "/products?category=marble",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.HomeProducts.item4.title",
    descriptionKey: "HomeData.HomeProducts.item4.description",
    href: "/products?category=gem-stone",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.HomeProducts.item5.title",
    descriptionKey: "HomeData.HomeProducts.item5.description",
    href: "/products?category=cement-stone",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.HomeProducts.item6.title",
    descriptionKey: "HomeData.HomeProducts.item6.description",
    href: "/products?category=artificial-marble",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.HomeProducts.item7.title",
    descriptionKey: "HomeData.HomeProducts.item7.description",
    href: "/products?category=porcelain-slab",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
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
    titleKey: "HomeData.Partners.item0.title",
    descriptionKey: "HomeData.Partners.item0.description",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.Partners.item1.title",
    descriptionKey: "HomeData.Partners.item1.description",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.Partners.item2.title",
    descriptionKey: "HomeData.Partners.item2.description",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.Partners.item3.title",
    descriptionKey: "HomeData.Partners.item3.description",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.Partners.item4.title",
    descriptionKey: "HomeData.Partners.item4.description",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
  {
    titleKey: "HomeData.Partners.item5.title",
    descriptionKey: "HomeData.Partners.item5.description",
    image: HOME_VISUAL_PLACEHOLDER_IMAGE,
  },
] as const satisfies ReadonlyArray<{
  titleKey: AppMessageKey;
  descriptionKey: AppMessageKey;
  image: string;
}>;

const NEWS_FEATURE_CONFIG = {
  titleKey: "HomeData.NewsFeature.title",
  excerptKey: "HomeData.NewsFeature.excerpt",
  href: "/news",
  image: HOME_VISUAL_PLACEHOLDER_IMAGE,
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
    description: t(item.descriptionKey),
    image: item.image,
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

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: "Youtube",
    icon: "/assets/icons/social/youtube.png",
    posts: [
      {
        title: "Engineering project decryption",
        href: "https://www.youtube.com/@ZYLStoneSlabEngineering",
        image: HOME_VISUAL_PLACEHOLDER_IMAGE,
      },
      {
        title: "Project cases",
        href: "https://www.youtube.com/@ZYLStoneSlabEngineering",
        image: HOME_VISUAL_PLACEHOLDER_IMAGE,
      },
      {
        title: "ZYL",
        href: "https://www.youtube.com/@ZYLStoneSlabEngineering",
        image: HOME_VISUAL_PLACEHOLDER_IMAGE,
      },
    ],
  },
  {
    name: "Instagram",
    icon: "/assets/icons/social/instagram.png",
    posts: [
      {
        title: "ZYL Stone I GEM stone slabs",
        href: "https://www.instagram.com/zyl.stone.slab/",
        image: HOME_VISUAL_PLACEHOLDER_IMAGE,
      },
      {
        title: "ZYL Stone I High-Performance Inorganic lerrazzo",
        href: "https://www.instagram.com/zyl.stone.slab/",
        image: HOME_VISUAL_PLACEHOLDER_IMAGE,
      },
      {
        title: "ZYL Stone Marble I Eternal Beauty Space Choice",
        href: "https://www.instagram.com/zyl.stone.slab/",
        image: HOME_VISUAL_PLACEHOLDER_IMAGE,
      },
    ],
  },
  {
    name: "Pinterest",
    icon: "/assets/icons/social/pinterest.png",
    posts: [
      {
        title: "Flexible Stone1",
        href: "https://www.pinterest.com/ZYLstoneslabengineering/",
        image: HOME_VISUAL_PLACEHOLDER_IMAGE,
      },
      {
        title: "nurse station",
        href: "https://www.pinterest.com/ZYLstoneslabengineering/",
        image: HOME_VISUAL_PLACEHOLDER_IMAGE,
      },
      {
        title: "gem",
        href: "https://www.pinterest.com/ZYLstoneslabengineering/",
        image: HOME_VISUAL_PLACEHOLDER_IMAGE,
      },
    ],
  },
];
