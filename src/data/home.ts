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

type AppTranslator = _Translator<AppMessages>;
type AppMessageKey = Parameters<AppTranslator>[0];

export const HERO_SLIDES: HeroSlide[] = [
  {
    type: "video",
    src: "/assets/hero/home-hero.mp4",
    alt: "ZYL Quartz",
  },
  {
    type: "image",
    src: "/assets/hero/home-hero-slide-2.png",
    alt: "ZYL Stone hero slide",
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
    image: "/assets/about/about-album-wayon-group.jpg",
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item1.title",
    textKey: "HomeData.AboutAlbum.item1.text",
    image: "/assets/about/yunfu-wayon.webp",
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item2.title",
    textKey: "HomeData.AboutAlbum.item2.text",
    image: "/assets/about/foshan-showroom.jpg",
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item3.title",
    textKey: "HomeData.AboutAlbum.item3.text",
    image: "/assets/about/guangdong-wayon.jpg",
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item4.title",
    textKey: "HomeData.AboutAlbum.item4.text",
    image: "/assets/about/shanghai-wayon.jpg",
    href: "/about",
  },
  {
    titleKey: "HomeData.AboutAlbum.item5.title",
    textKey: "HomeData.AboutAlbum.item5.text",
    image: "/assets/about/guangzhou-wayon.png",
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
    image: "/assets/solutions/quartz-zero-silica.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item1.title",
    descriptionKey: "HomeData.HomeProducts.item1.description",
    href: "/products?category=terrazzo",
    image: "/assets/solutions/terrazzo.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item2.title",
    descriptionKey: "HomeData.HomeProducts.item2.description",
    href: "/products?category=flexible-stone",
    image: "/assets/solutions/flexible-stone.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item3.title",
    descriptionKey: "HomeData.HomeProducts.item3.description",
    href: "/products?category=marble",
    image: "/assets/solutions/marble.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item4.title",
    descriptionKey: "HomeData.HomeProducts.item4.description",
    href: "/products?category=gem-stone",
    image: "/assets/solutions/gem-stone.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item5.title",
    descriptionKey: "HomeData.HomeProducts.item5.description",
    href: "/products?category=cement-stone",
    image: "/assets/solutions/cement-stone.jpg",
  },
  {
    titleKey: "HomeData.HomeProducts.item6.title",
    descriptionKey: "HomeData.HomeProducts.item6.description",
    href: "/products?category=artificial-marble",
    image: "/assets/solutions/artificial-marble.webp",
  },
  {
    titleKey: "HomeData.HomeProducts.item7.title",
    descriptionKey: "HomeData.HomeProducts.item7.description",
    href: "/products?category=porcelain-slab",
    image: "/assets/solutions/porcelain-slab.webp",
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
    image: "/assets/solutions/kitchen-countertops.webp",
  },
  {
    labelKey: "HomeData.Solutions.item1.label",
    titleKey: "HomeData.Solutions.item1.title",
    descriptionKey: "HomeData.Solutions.item1.description",
    href: "/solution",
    image: "/assets/solutions/bathroom-spaces.webp",
  },
  {
    labelKey: "HomeData.Solutions.item2.label",
    titleKey: "HomeData.Solutions.item2.title",
    descriptionKey: "HomeData.Solutions.item2.description",
    href: "/solution",
    image: "/assets/solutions/furniture-tops.webp",
  },
  {
    labelKey: "HomeData.Solutions.item3.label",
    titleKey: "HomeData.Solutions.item3.title",
    descriptionKey: "HomeData.Solutions.item3.description",
    href: "/solution",
    image: "/assets/solutions/wall-floor.jpg",
  },
  {
    labelKey: "HomeData.Solutions.item4.label",
    titleKey: "HomeData.Solutions.item4.title",
    descriptionKey: "HomeData.Solutions.item4.description",
    href: "/solution",
    image: "/assets/solutions/cabinet-countertops.webp",
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
    image: "/assets/cases/case-1-dominica-hotel.png",
    href: "/assets/cases/case-1-dominica-hotel.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item1.title",
    image: "/assets/cases/case-2-congo-hilton.png",
    href: "/assets/cases/case-2-congo-hilton.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item2.title",
    image: "/assets/cases/case-3-canadian-restaurant.png",
    href: "/assets/cases/case-3-canadian-restaurant.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item3.title",
    image: "/assets/cases/case-4-finland-apartment.png",
    href: "/assets/cases/case-4-finland-apartment.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item4.title",
    image: "/assets/cases/case-5-qatar-vendome.png",
    href: "/assets/cases/case-5-qatar-vendome.png",
  },
  {
    titleKey: "HomeData.EngineeringCases.item5.title",
    image: "/assets/cases/case-6-us-vacation-villa.png",
    href: "/assets/cases/case-6-us-vacation-villa.png",
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
    image: "/assets/partner/contractor.png",
  },
  {
    titleKey: "HomeData.Partners.item1.title",
    descriptionKey: "HomeData.Partners.item1.description",
    image: "/assets/partner/designer.png",
  },
  {
    titleKey: "HomeData.Partners.item2.title",
    descriptionKey: "HomeData.Partners.item2.description",
    image: "/assets/partner/wholesaler.png",
  },
  {
    titleKey: "HomeData.Partners.item3.title",
    descriptionKey: "HomeData.Partners.item3.description",
    image: "/assets/partner/kitchen-bathroom-company.png",
  },
  {
    titleKey: "HomeData.Partners.item4.title",
    descriptionKey: "HomeData.Partners.item4.description",
    image: "/assets/partner/furniture-designer.png",
  },
  {
    titleKey: "HomeData.Partners.item5.title",
    descriptionKey: "HomeData.Partners.item5.description",
    image: "/assets/partner/developer.png",
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
  image: "/assets/news/terrazzo-flooring-cover.jpg",
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

export function getAboutIntro(t: AppTranslator) {
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

export function getNewsFeature(t: AppTranslator) {
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
    name: "Facebook",
    icon: "/assets/icons/social/facebook.png",
    posts: [
      {
        title: "ZYL Stone I The Big5 Global Dubai 2025",
        href: "https://www.facebook.com/share/p/19ZPWnwB73/",
        image: "/assets/social/facebook-big5.jpg",
      },
      {
        title: "ZYL Stone I Quartz Countertops",
        href: "https://www.facebook.com/share/p/1Jwao87VRA/",
        image: "/assets/social/facebook-quartz-countertops.png",
      },
      {
        title: "ZYL Stone I Quartz Countertop Project for Tap & Barrel Restaurant, Canada",
        href: "https://www.facebook.com/share/p/1C4uhz48ES/",
        image: "/assets/social/facebook-tap-barrel.jpg",
      },
    ],
  },
  {
    name: "Linkedin",
    icon: "/assets/icons/social/linkedin.png",
    posts: [
      {
        title: "ZYL Stone I Milan Hotel Furniture Project",
        href: "https://www.linkedin.com/feed/update/urn:li:activity:7400081930316206080",
        image: "/assets/social/linkedin-milan-hotel.png",
      },
      {
        title: "ZYL Stone I Qatar Vendome Plaza Shopping Mall Project",
        href: "https://www.linkedin.com/pulse/wayon-stone-qatar-vend%C3%B4me-plaza-shopping-mall-high-end-commercial-broyc",
        image: "/assets/social/linkedin-qatar-vendome.png",
      },
      {
        title: "MCM Stone | Ultra-thin; Bendable, Waterproof, Frieproof",
        href: "https://www.linkedin.com/pulse/new-choices-stone-engineering-procurement-mcm-reshape-benchmark-w6gvc",
        image: "/assets/social/linkedin-mcm-stone.png",
      },
    ],
  },
  {
    name: "Tiktok",
    icon: "/assets/icons/social/tiktok.png",
    posts: [
      {
        title: "Mcmstone",
        href: "https://www.tiktok.com/",
        image: "/assets/social/tiktok-mcm-stone.png",
      },
      {
        title: "Quartz",
        href: "https://www.tiktok.com/",
        image: "/assets/social/tiktok-quartz.png",
      },
      {
        title: "Zero silica",
        href: "https://www.tiktok.com/",
        image: "/assets/social/tiktok-zero-silica.png",
      },
    ],
  },
  {
    name: "Youtube",
    icon: "/assets/icons/social/youtube.png",
    posts: [
      {
        title: "Engineering project decryption",
        href: "https://www.youtube.com/channel/UC_SJpdXv6gQ9nhOzfO9XeLw",
        image: "/assets/social/youtube-engineering-project.png",
      },
      {
        title: "Project cases",
        href: "https://www.youtube.com/channel/UC_SJpdXv6gQ9nhOzfO9XeLw",
        image: "/assets/social/youtube-project-cases.png",
      },
      {
        title: "ZYL",
        href: "https://www.youtube.com/channel/UC_SJpdXv6gQ9nhOzfO9XeLw",
        image: "/assets/social/youtube-wayon-base.png",
      },
    ],
  },
  {
    name: "Instagram",
    icon: "/assets/icons/social/instagram.png",
    posts: [
      {
        title: "ZYL Stone I GEM stone slabs",
        href: "https://www.instagram.com/wayonstone/",
        image: "/assets/social/instagram-gem.png",
      },
      {
        title: "ZYL Stone I High-Performance Inorganic lerrazzo",
        href: "https://www.instagram.com/wayonstone/",
        image: "/assets/social/instagram-terrazzo.png",
      },
      {
        title: "ZYL Stone Marble I Eternal Beauty Space Choice",
        href: "https://www.instagram.com/wayonstone/",
        image: "/assets/social/instagram-marble.png",
      },
    ],
  },
  {
    name: "Pinterest",
    icon: "/assets/icons/social/pinterest.png",
    posts: [
      {
        title: "Flexible Stone1",
        href: "https://www.pinterest.com/",
        image: "/assets/social/pinterest-flexible-stone.jpg",
      },
      {
        title: "nurse station",
        href: "https://www.pinterest.com/",
        image: "/assets/social/pinterest-nurse-station.jpg",
      },
      {
        title: "gem",
        href: "https://www.pinterest.com/",
        image: "/assets/social/pinterest-gem.jpg",
      },
    ],
  },
  {
    name: "VK",
    icon: "/assets/icons/social/vk.png",
    posts: [
      {
        title: "ZYL Stone I Granite EngineeringProject-School",
        href: "https://vk.com/wall-232552225_112",
        image: "/assets/social/vk-engineered-stone.png",
      },
      {
        title: "ZYL Stone I Zero-Silica Quartz Stone",
        href: "https://vk.com/wall-232552225_60",
        image: "/assets/social/vk-zero-silica-quartz.png",
      },
      {
        title: "WG135",
        href: "https://vk.com/wall-232552225_60",
        image: "/assets/social/vk-wg135.png",
      },
    ],
  },
];
