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

export const HERO_SLIDES: HeroSlide[] = [
  {
    type: "video",
    src: "/assets/hero/home-hero.mp4",
    alt: "Wayon Quartz",
  },
  {
    type: "image",
    src: "/assets/hero/home-hero-slide-2.png",
    alt: "Wayon Stone hero slide",
  },
];

export const getAboutIntro = (t: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ({
  title: t("HomeData.AboutIntro.title"),
  paragraphs: [
    t("HomeData.AboutIntro.p1"),
    t("HomeData.AboutIntro.p2")
  ],
  href: "/about",
  cta: t("HomeData.AboutIntro.cta"),
});

export const getAboutAlbum = (t: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): AboutAlbumItem[] => [
  {
    title: t("HomeData.AboutAlbum.item0.title"),
    text: t("HomeData.AboutAlbum.item0.text"),
    image: "/assets/about/about-album-wayon-group.jpg",
    href: "/about"
  },
  {
    title: t("HomeData.AboutAlbum.item1.title"),
    text: t("HomeData.AboutAlbum.item1.text"),
    image: "/assets/about/yunfu-wayon.webp",
    href: "/about"
  },
  {
    title: t("HomeData.AboutAlbum.item2.title"),
    text: t("HomeData.AboutAlbum.item2.text"),
    image: "/assets/about/foshan-showroom.jpg",
    href: "/about"
  },
  {
    title: t("HomeData.AboutAlbum.item3.title"),
    text: t("HomeData.AboutAlbum.item3.text"),
    image: "/assets/about/guangdong-wayon.jpg",
    href: "/about"
  },
  {
    title: t("HomeData.AboutAlbum.item4.title"),
    text: t("HomeData.AboutAlbum.item4.text"),
    image: "/assets/about/shanghai-wayon.jpg",
    href: "/about"
  },
  {
    title: t("HomeData.AboutAlbum.item5.title"),
    text: t("HomeData.AboutAlbum.item5.text"),
    image: "/assets/about/guangzhou-wayon.png",
    href: "/about"
  }
];

export const getHomeProducts = (t: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): ProductItem[] => [
  {
    title: t("HomeData.HomeProducts.item0.title"),
    description: t("HomeData.HomeProducts.item0.description"),
    href: "/products?category=quartz",
    image: "/assets/solutions/quartz-zero-silica.jpg"
  },
  {
    title: t("HomeData.HomeProducts.item1.title"),
    description: t("HomeData.HomeProducts.item1.description"),
    href: "/products?category=terrazzo",
    image: "/assets/solutions/terrazzo.jpg"
  },
  {
    title: t("HomeData.HomeProducts.item2.title"),
    description: t("HomeData.HomeProducts.item2.description"),
    href: "/products?category=flexible-stone",
    image: "/assets/solutions/flexible-stone.jpg"
  },
  {
    title: t("HomeData.HomeProducts.item3.title"),
    description: t("HomeData.HomeProducts.item3.description"),
    href: "/products?category=marble",
    image: "/assets/solutions/marble.jpg"
  },
  {
    title: t("HomeData.HomeProducts.item4.title"),
    description: t("HomeData.HomeProducts.item4.description"),
    href: "/products?category=gem-stone",
    image: "/assets/solutions/gem-stone.jpg"
  },
  {
    title: t("HomeData.HomeProducts.item5.title"),
    description: t("HomeData.HomeProducts.item5.description"),
    href: "/products?category=cement-stone",
    image: "/assets/solutions/cement-stone.jpg"
  },
  {
    title: t("HomeData.HomeProducts.item6.title"),
    description: t("HomeData.HomeProducts.item6.description"),
    href: "/products?category=artificial-marble",
    image: "/assets/solutions/artificial-marble.webp"
  },
  {
    title: t("HomeData.HomeProducts.item7.title"),
    description: t("HomeData.HomeProducts.item7.description"),
    href: "/products?category=porcelain-slab",
    image: "/assets/solutions/porcelain-slab.webp"
  }
];

export const getSolutions = (t: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): SolutionItem[] => [
  {
    label: t("HomeData.Solutions.item0.label"),
    title: t("HomeData.Solutions.item0.title"),
    description: t("HomeData.Solutions.item0.description"),
    href: "/solution",
    image: "/assets/solutions/kitchen-countertops.webp"
  },
  {
    label: t("HomeData.Solutions.item1.label"),
    title: t("HomeData.Solutions.item1.title"),
    description: t("HomeData.Solutions.item1.description"),
    href: "/solution",
    image: "/assets/solutions/bathroom-spaces.webp"
  },
  {
    label: t("HomeData.Solutions.item2.label"),
    title: t("HomeData.Solutions.item2.title"),
    description: t("HomeData.Solutions.item2.description"),
    href: "/solution",
    image: "/assets/solutions/furniture-tops.webp"
  },
  {
    label: t("HomeData.Solutions.item3.label"),
    title: t("HomeData.Solutions.item3.title"),
    description: t("HomeData.Solutions.item3.description"),
    href: "/solution",
    image: "/assets/solutions/wall-floor.jpg"
  },
  {
    label: t("HomeData.Solutions.item4.label"),
    title: t("HomeData.Solutions.item4.title"),
    description: t("HomeData.Solutions.item4.description"),
    href: "/solution",
    image: "/assets/solutions/cabinet-countertops.webp"
  }
];

export const ENGINEERING_CASES: CaseItem[] = [
  {
    title: "Dominica Hotel",
    image: "/assets/cases/case-1-dominica-hotel.png",
    href: "/assets/cases/case-1-dominica-hotel.png",
  },
  {
    title: "Congo Hilton",
    image: "/assets/cases/case-2-congo-hilton.png",
    href: "/assets/cases/case-2-congo-hilton.png",
  },
  {
    title: "Canadian Chain Restaurant",
    image: "/assets/cases/case-3-canadian-restaurant.png",
    href: "/assets/cases/case-3-canadian-restaurant.png",
  },
  {
    title: "Finland Apartment Case",
    image: "/assets/cases/case-4-finland-apartment.png",
    href: "/assets/cases/case-4-finland-apartment.png",
  },
  {
    title: "Qatar Vendome Mall",
    image: "/assets/cases/case-5-qatar-vendome.png",
    href: "/assets/cases/case-5-qatar-vendome.png",
  },
  {
    title: "US Seaside Vacation Villa",
    image: "/assets/cases/case-6-us-vacation-villa.png",
    href: "/assets/cases/case-6-us-vacation-villa.png",
  },
];

export const getPartners = (t: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): PartnerItem[] => [
  {
    title: t("HomeData.Partners.item0.title"),
    description: t("HomeData.Partners.item0.description"),
    image: "/assets/partner/contractor.png"
  },
  {
    title: t("HomeData.Partners.item1.title"),
    description: t("HomeData.Partners.item1.description"),
    image: "/assets/partner/designer.png"
  },
  {
    title: t("HomeData.Partners.item2.title"),
    description: t("HomeData.Partners.item2.description"),
    image: "/assets/partner/wholesaler.png"
  },
  {
    title: t("HomeData.Partners.item3.title"),
    description: t("HomeData.Partners.item3.description"),
    image: "/assets/partner/kitchen-bathroom-company.png"
  },
  {
    title: t("HomeData.Partners.item4.title"),
    description: t("HomeData.Partners.item4.description"),
    image: "/assets/partner/furniture-designer.png"
  },
  {
    title: t("HomeData.Partners.item5.title"),
    description: t("HomeData.Partners.item5.description"),
    image: "/assets/partner/developer.png"
  }
];

export const NEWS_FEATURE = {
  title: "Why Inorganic Terrazzo Flooring Is Ideal for High-Traffic Commercial Spaces",
  excerpt:
    "Nowadays, modern commercial projects place far higher expectations on flooring materials than before. Whether it's a mall with nonstop foot traffic, a hospital that requires strict air-quality control, or a transport hub facing constant abrasion, the wrong material choice quickly becomes a maintenance problem.",
  href: "/news",
  image: "/assets/news/terrazzo-flooring-cover.jpg",
};

export const NEWS_ITEMS: NewsItem[] = [
  {
    title: "From Flooring to Facades: How Flexible Stone is Changing Construction Trends",
    href: "/news",
    day: "24",
    yearMonth: "2025-11",
  },
  {
    title: "How to Source Premium Marble Solutions for Commercial Projects",
    href: "/news",
    day: "17",
    yearMonth: "2025-11",
  },
  {
    title: "Custom Quartz Countertops: Key Trends to Follow in 2026",
    href: "/news",
    day: "10",
    yearMonth: "2025-11",
  },
  {
    title: "White Quartz Countertops for Minimalist Kitchens in Commercial Projects",
    href: "/news",
    day: "31",
    yearMonth: "2025-10",
  },
];

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: "Facebook",
    icon: "/assets/icons/social/facebook.png",
    posts: [
      {
        title: "Wayon Stone I The Big5 Global Dubai 2025",
        href: "https://www.facebook.com/share/p/19ZPWnwB73/",
        image: "/assets/social/facebook-big5.jpg",
      },
      {
        title: "Wayon Stone I Quartz Countertops",
        href: "https://www.facebook.com/share/p/1Jwao87VRA/",
        image: "/assets/social/facebook-quartz-countertops.png",
      },
      {
        title: "Wayon Stone I Quartz Countertop Project for Tap & Barrel Restaurant, Canada",
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
        title: "Wayon Stone I Milan Hotel Furniture Project",
        href: "https://www.linkedin.com/feed/update/urn:li:activity:7400081930316206080",
        image: "/assets/social/linkedin-milan-hotel.png",
      },
      {
        title: "Wayon Stone I Qatar Vendome Plaza Shopping Mall Project",
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
        title: "Wayon",
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
        title: "Wayon Stone I GEM stone slabs",
        href: "https://www.instagram.com/wayonstone/",
        image: "/assets/social/instagram-gem.png",
      },
      {
        title: "Wayon Stone I High-Performance Inorganic lerrazzo",
        href: "https://www.instagram.com/wayonstone/",
        image: "/assets/social/instagram-terrazzo.png",
      },
      {
        title: "Wayon Stone Marble I Eternal Beauty Space Choice",
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
        title: "Wayon Stone I Granite EngineeringProject-School",
        href: "https://vk.com/wall-232552225_112",
        image: "/assets/social/vk-engineered-stone.png",
      },
      {
        title: "Wayon Stone I Zero-Silica Quartz Stone",
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
