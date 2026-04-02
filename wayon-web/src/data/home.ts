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

export const ABOUT_INTRO = {
  title: "ABOUT\nWAYON STONE",
  paragraphs: [
    "Wayon Stone, Established in China in 1982, is a global manufacturer of advanced stone materials with 4 major productions and processing bases. Wayon Stone has an annual output exceeding 3 million m² of high-quality quartz, terrazzo, flexible stone, marble, artificial marble, gemstone, sintered stone, cement stone and other natural and artificial stone materials.",
    "Wayon specializes in producing and processing various types of stone products, including kitchen countertops, bathroom vanity tops, furniture table tops, wall and floor tiles, and custom-engineered stone products.",
  ],
  href: "/about",
  cta: "Learn More About Us",
};

export const ABOUT_ALBUM: AboutAlbumItem[] = [
  {
    title: "Wayon Stone Group",
    text: "Wayon has developed into a comprehensive stone enterprise integrating quarry resources, R&D and innovation, manufacturing, and engineering solutions. The company operates an extensive network of subsidiaries and branches, including Yunfu Wayon, the Foshan Showroom, Guangdong Wayon Industrial, Shanghai Wayon, Guangzhou Wayon, as well as the C-Stone Professional Engineering Solutions Center. Together, these entities form a complete and well-structured industrial value chain.",
    image: "/assets/about/about-album-wayon-group.jpg",
    href: "/about",
  },
  {
    title: "Yunfu Wayon",
    text: "Yunfu Wayon (the Yunfu production base of Wayon Stone) covers a total area of 20,000 m², including 18,000 m² of factory facilities and a 2,000 m² office building. The base is equipped with 4 automated slab pressing lines, 1 independently developed and upgraded block-type production line, and 2 Italian polishing lines.",
    image: "/assets/about/yunfu-wayon.webp",
    href: "/about",
  },
  {
    title: "Foshan Showroom",
    text: "The Hallmark Brand Showroom, meticulously created by Wayon Stone, spans an area of 1,400 square meters. Through a series of thoughtfully designed themed spaces, the showroom presents a comprehensive showcase of Wayon's overall strength as a leading global stone supplier.",
    image: "/assets/about/foshan-showroom.jpg",
    href: "/about",
  },
  {
    title: "Guangdong Wayon",
    text: "The Heyuan Production Base of Wayon Stone covers a total area of 60,000 square meters, including 40,000 square meters of manufacturing facilities and a 1,200-square-meter R&D center. The base fully leverages high-quality quartz mining resources and the advantages of an integrated, full-industry-chain operation encompassing quartz sand processing and slab production.",
    image: "/assets/about/guangdong-wayon.jpg",
    href: "/about",
  },
  {
    title: "Shanghai Wayon",
    text: "Shanghai Wayon, established in 1998, is located at No. 4589 Cao'an Highway, Jiading District, Shanghai, with an office and exhibition area of 1,600 square meters. After decades of development, Shanghai Wayon has supplied countless high-quality stone products to projects across East China, earning widespread customer recognition and building a strong and reputable presence in the market.",
    image: "/assets/about/shanghai-wayon.jpg",
    href: "/about",
  },
  {
    title: "Guangzhou Wayon",
    text: "Established in 1990 as the former Guangzhou Lixin Stone Craft Co., Ltd., specializes in quartz, terrazzo, natural marble, sintered stone slabs, granite, and other stone products. For nearly three decades, it has supplied an extensive volume of stone materials to major construction and development projects in South China and across the country during China's period of rapid economic reform and urban development. Guangzhou Wayon has been recognized as a Famous Trademark of Guangzhou and honored as one of the Top Ten Stone Enterprises in Guangdong Province.",
    image: "/assets/about/guangzhou-wayon.png",
    href: "/about",
  },
];

export const HOME_PRODUCTS: ProductItem[] = [
  {
    title: "Quart Stone & Zero Silica Stone",
    description:
      "Quartz Stone (90% quartz sand) & Zero Silica Stone (no silica), advanced-made. Wear/stain-resistant; Ideal for kitchen countertopsbathroom vanity tops, mall surfaces—durable, versatile for global projects.",
    href: "/products?category=quartz",
    image: "/assets/solutions/quartz-zero-silica.jpg",
  },
  {
    title: "Terrazzo",
    description:
      "Natural aggregates + eco-adhesive, high-pressure-formed. Large slabs ease install; hard, wear-resistant, non-flammable (green building). Indoor and outdoor floors and walls.",
    href: "/products?category=terrazzo",
    image: "/assets/solutions/terrazzo.jpg",
  },
  {
    title: "Flexible Stone",
    description:
      "Stone texture + flexibility. Lightweight, easy to install on walls/floors/irregular surfaces. Toxic-free, eco-safe; rich textures elevate modern/luxury spaces.",
    href: "/products?category=flexible-stone",
    image: "/assets/solutions/flexible-stone.jpg",
  },
  {
    title: "Marble",
    description:
      "Wayon Marble features unique natural textures and elegant luxury—ideal for hotel lobbies, fitting interior walls/floors of high-end malls, luxury mansions, etc.",
    href: "/products?category=marble",
    image: "/assets/solutions/marble.jpg",
  },
  {
    title: "Gem stone",
    description:
      "Precision-spliced gem slices, glazed for luster. Custom-shapable; luxurious shine & translucency. Fits accent walls, high-end furniture tops.",
    href: "/products?category=gem-stone",
    image: "/assets/solutions/gem-stone.jpg",
  },
  {
    title: "Cement Stone",
    description:
      "High-strength cement, high-pressure-made. Rich colors, surface holes; stable, non-flammable, insulating. Ideal for indoor/outdoor walls.",
    href: "/products?category=cement-stone",
    image: "/assets/solutions/cement-stone.jpg",
  },
  {
    title: "Artifical Marble",
    description:
      "Artificial Marble: natural mineral powder + eco-friendly binders, high-temp & high-pressure formed. Wear/scratch-resistant, non-toxic. Ideal for kitchen/bath vanities, walls, facades. Green building compliant, sleek versatile aesthetics.",
    href: "/products?category=artificial-marble",
    image: "/assets/solutions/artificial-marble.webp",
  },
  {
    title: "Porcelain Slab",
    description:
      "Uses mineral powder and eco-friendly binders, formed by high-temperature & high-pressure processes. Wear-resistant, heat-resistant and eco-safe, it fits indoor/outdoor walls, mall panels, hotel, kitchen/bath/furniture tops.",
    href: "/products?category=porcelain-slab",
    image: "/assets/solutions/porcelain-slab.webp",
  },
];

export const SOLUTIONS: SolutionItem[] = [
  {
    label: "Kitchen Countertops",
    title: "Kitchen Countertops",
    description:
      "The Wayon Stone Processing Center boasts a 6,500-square-meter factory and is equipped with 12 Taiwanese bridge cutting machines, an Italian five-axis phototypesetting automatic suction cup bridge cutting machine, an Italian automatic edge grinding machine, two Taiwanese automatic edge grinding machines, a cabinet countertop assembly line, three CNC drilling machines, five high-quality sample machines, and a 4+8-head molding system.\nThe center specializes in processing natural stone rough block slabs, as well as quartz, terrazzo, cement stone, and rock slabs.",
    href: "/solution",
    image: "/assets/solutions/kitchen-countertops.webp",
  },
  {
    label: "Bathroom Spaces",
    title: "Bathroom Spaces",
    description:
      "The Wayon Stone Processing Center boasts a 6,500-square-meter factory and is equipped with 12 Taiwanese bridge cutting machines, an Italian five-axis phototypesetting automatic suction cup bridge cutting machine, an Italian automatic edge grinding machine, two Taiwanese automatic edge grinding machines, a cabinet countertop assembly line, three CNC drilling machines, five high-quality sample machines, and a 4+8-head molding system.\nThe center specializes in processing natural stone rough block slabs, as well as quartz, terrazzo, cement stone, and rock slabs.",
    href: "/solution",
    image: "/assets/solutions/bathroom-spaces.webp",
  },
  {
    label: "Furniture Tops",
    title: "Furniture Tops",
    description:
      "The Wayon Stone Processing Center boasts a 6,500-square-meter factory and is equipped with 12 Taiwanese bridge cutting machines, an Italian five-axis phototypesetting automatic suction cup bridge cutting machine, an Italian automatic edge grinding machine, two Taiwanese automatic edge grinding machines, a cabinet countertop assembly line, three CNC drilling machines, five high-quality sample machines, and a 4+8-head molding system.\nThe center specializes in processing natural stone rough block slabs, as well as quartz, terrazzo, cement stone, and rock slabs.",
    href: "/solution",
    image: "/assets/solutions/furniture-tops.webp",
  },
  {
    label: "Wall & Floor",
    title: "Wall & Floor",
    description:
      "The Wayon Stone Processing Center boasts a 6,500-square-meter factory and is equipped with 12 Taiwanese bridge cutting machines, an Italian five-axis phototypesetting automatic suction cup bridge cutting machine, an Italian automatic edge grinding machine, two Taiwanese automatic edge grinding machines, a cabinet countertop assembly line, three CNC drilling machines, five high-quality sample machines, and a 4+8-head molding system.\nThe center specializes in processing natural stone rough block slabs, as well as quartz, terrazzo, cement stone, and rock slabs.",
    href: "/solution",
    image: "/assets/solutions/wall-floor.jpg",
  },
  {
    label: "Cabinet Countertops",
    title: "Cabinet Countertops",
    description:
      "The Wayon Stone Processing Center boasts a 6,500-square-meter factory and is equipped with 12 Taiwanese bridge cutting machines, an Italian five-axis phototypesetting automatic suction cup bridge cutting machine, an Italian automatic edge grinding machine, two Taiwanese automatic edge grinding machines, a cabinet countertop assembly line, three CNC drilling machines, five high-quality sample machines, and a 4+8-head molding system.\nThe center specializes in processing natural stone rough block slabs, as well as quartz, terrazzo, cement stone, and rock slabs.",
    href: "/solution",
    image: "/assets/solutions/cabinet-countertops.webp",
  },
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

export const PARTNERS: PartnerItem[] = [
  {
    title: "Contractor",
    description:
      "Wayon Stone delivers reliable quality, precise engineering support, and responsive service. Their materials consistently meet project requirements and timelines, making them a trusted long-term partner for contractors.",
    image: "/assets/partner/contractor.png",
  },
  {
    title: "Designer",
    description:
      "Designers value Wayon Stone for its diverse material selection, refined aesthetics, and technical reliability, which enable creative freedom while ensuring performance in high-end residential and commercial projects.",
    image: "/assets/partner/designer.png",
  },
  {
    title: "Wholesaler",
    description:
      "Wholesalers trust Wayon Stone for its high-quality materials, reliable supply chain, and competitive pricing, ensuring consistent product availability and strong support for large-volume orders.",
    image: "/assets/partner/wholesaler.png",
  },
  {
    title: "Kitchen & Bathroom Company",
    description:
      "Wayon Stone provides consistent quality, accurate fabrication, and dependable delivery. Their quartz and engineered stone surfaces integrate seamlessly into kitchen and bathroom projects with excellent results.",
    image: "/assets/partner/kitchen-bathroom-company.png",
  },
  {
    title: "Furniture Designer",
    description:
      "Furniture designers rely on Wayon Stone for its premium stone surfaces, precision cutting, and versatile finishes, enabling the creation of stylish, durable, and functional furniture pieces.",
    image: "/assets/partner/furniture-designer.png",
  },
  {
    title: "Developer",
    description:
      "Developers choose Wayon Stone for its consistent quality, large-scale supply capacity, and professional project support, ensuring timely delivery and superior stone solutions for residential and commercial developments.",
    image: "/assets/partner/developer.png",
  },
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
