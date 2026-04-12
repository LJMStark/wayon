import type { NavigationKey } from "@/data/navigation";

type ProductCategoryShowcaseContent = {
  slug: string;
  titleKey: NavigationKey;
  descriptionKey: NavigationKey;
  imageSrc: string;
  background: "gray" | "white";
};

export const PRODUCT_CATEGORY_SHOWCASES: ProductCategoryShowcaseContent[] = [
  {
    slug: "quartz",
    titleKey: "quartzStone",
    descriptionKey: "quartzDesc",
    imageSrc: "/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg",
    background: "gray",
  },
  {
    slug: "silica-free",
    titleKey: "silicaFree",
    descriptionKey: "silicaDesc",
    imageSrc: "/assets/products/4dfad52bc4f8b2c2bceabe1eb954a8de.jpg",
    background: "white",
  },
  {
    slug: "terrazzo",
    titleKey: "terrazzo",
    descriptionKey: "terrazzoDesc",
    imageSrc: "/assets/products/c534a997a58eef6a2aa52b5d5d56c8a5.jpg",
    background: "gray",
  },
  {
    slug: "flexible-stone",
    titleKey: "flexibleStone",
    descriptionKey: "flexibleDesc",
    imageSrc: "/assets/products/9ac3cb95ac618347328625a26f0f9df5.jpg",
    background: "white",
  },
  {
    slug: "marble",
    titleKey: "marble",
    descriptionKey: "marbleDesc",
    imageSrc: "/assets/products/4114a4ac18610909eb9728c75328bcff.jpg",
    background: "gray",
  },
  {
    slug: "gem-stone",
    titleKey: "gemStone",
    descriptionKey: "gemDesc",
    imageSrc: "/assets/products/7037b74ccb409b9cca57110044283d96.jpg",
    background: "white",
  },
  {
    slug: "cement-stone",
    titleKey: "cementStone",
    descriptionKey: "cementDesc",
    imageSrc: "/assets/products/b3939f4e7c1209a0d06c922bc717b30a.jpg",
    background: "gray",
  },
  {
    slug: "artificial-marble",
    titleKey: "artificialMarble",
    descriptionKey: "artificialDesc",
    imageSrc: "/assets/products/9ac3cb95ac618347328625a26f0f9df5.jpg",
    background: "white",
  },
  {
    slug: "porcelain-slab",
    titleKey: "porcelainSlab",
    descriptionKey: "porcelainDesc",
    imageSrc: "/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg",
    background: "gray",
  },
];
