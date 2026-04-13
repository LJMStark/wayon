import type { NavigationKey } from "@/data/navigation";
import { TRADE_YELLOW_PLACEHOLDER_IMAGE } from "../model/productExposure";

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
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "gray",
  },
  {
    slug: "silica-free",
    titleKey: "silicaFree",
    descriptionKey: "silicaDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "white",
  },
  {
    slug: "terrazzo",
    titleKey: "terrazzo",
    descriptionKey: "terrazzoDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "gray",
  },
  {
    slug: "flexible-stone",
    titleKey: "flexibleStone",
    descriptionKey: "flexibleDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "white",
  },
  {
    slug: "marble",
    titleKey: "marble",
    descriptionKey: "marbleDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "gray",
  },
  {
    slug: "gem-stone",
    titleKey: "gemStone",
    descriptionKey: "gemDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "white",
  },
  {
    slug: "cement-stone",
    titleKey: "cementStone",
    descriptionKey: "cementDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "gray",
  },
  {
    slug: "artificial-marble",
    titleKey: "artificialMarble",
    descriptionKey: "artificialDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "white",
  },
  {
    slug: "porcelain-slab",
    titleKey: "porcelainSlab",
    descriptionKey: "porcelainDesc",
    imageSrc: TRADE_YELLOW_PLACEHOLDER_IMAGE,
    background: "gray",
  },
];
